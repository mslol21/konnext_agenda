-- Extensão nativa do PostgreSQL para GiST com tipos escalares (btree_gist)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Constraint de Exclusão de Conflito Atômico para Agendamentos
-- Garante matematicamente que nenhum profissional pode ter dois agendamentos sobrepostos nos status ativos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_appointments'
    ) THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "no_overlapping_appointments"
        EXCLUDE USING gist (
            professional_id WITH =,
            tstzrange(start_at, end_at, '[)') WITH &&
        ) WHERE (status IN ('held', 'confirmed', 'in_progress'));
    END IF;
END $$;
