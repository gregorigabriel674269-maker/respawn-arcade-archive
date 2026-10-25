-- Pending: apply through Lovable Cloud once connected. Server-owned timestamps for remaining client-writable rows.
CREATE OR REPLACE FUNCTION public.clamp_library_played_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.played_at IS NOT NULL AND NEW.played_at > now() THEN NEW.played_at = now(); END IF;
  IF TG_OP = 'UPDATE' AND OLD.played_at IS NOT NULL AND (NEW.played_at IS NULL OR NEW.played_at < OLD.played_at) THEN NEW.played_at = OLD.played_at; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER library_played_at BEFORE INSERT OR UPDATE ON public.player_library FOR EACH ROW EXECUTE FUNCTION public.clamp_library_played_at();
CREATE OR REPLACE FUNCTION public.force_report_created_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.created_at = now(); RETURN NEW; END $$;
CREATE TRIGGER report_created_at BEFORE INSERT ON public.content_reports FOR EACH ROW EXECUTE FUNCTION public.force_report_created_at();
