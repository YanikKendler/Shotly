-- Add new columns to app_user
ALTER TABLE app_user ADD COLUMN isactive boolean NOT NULL DEFAULT true;
ALTER TABLE app_user ADD COLUMN revokeproafter date;

-- Update the tier constraint
ALTER TABLE app_user DROP CONSTRAINT app_user_tier_check;
ALTER TABLE app_user ADD CONSTRAINT app_user_tier_check
    CHECK (tier::text = ANY (ARRAY['BASIC'::character varying, 'PRO'::character varying, 'PRO_STUDENT'::character varying, 'PRO_FREE'::character varying]::text[]));

-- Drop old collaborator table and create new collaboration table
DROP TABLE IF EXISTS collaborator CASCADE;

CREATE TABLE collaboration (
    id uuid NOT NULL,
    shotlist_id uuid NOT NULL,
    user_id uuid,
    collaborationstate character varying(255),
    collaborationtype character varying(255),
    CONSTRAINT collaboration_collaborationstate_check CHECK (collaborationstate::text = ANY (ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'DECLINED'::character varying]::text[])),
    CONSTRAINT collaboration_collaborationtype_check CHECK (collaborationtype::text = ANY (ARRAY['EDIT'::character varying, 'VIEW'::character varying]::text[]))
);

CREATE SEQUENCE collaboration_seq START WITH 1 INCREMENT BY 50;

-- Create new junction table
CREATE TABLE shotlist_collaboration (
    shotlist_id uuid NOT NULL,
    collaborations_id uuid NOT NULL
);

-- Add constraints
ALTER TABLE ONLY collaboration ADD CONSTRAINT collaboration_pkey PRIMARY KEY (id);
ALTER TABLE ONLY shotlist_collaboration ADD CONSTRAINT shotlist_collaboration_pkey PRIMARY KEY (shotlist_id, collaborations_id);
ALTER TABLE ONLY shotlist_collaboration ADD CONSTRAINT uko8d60wp3ka8ek64tquq0o1mtv UNIQUE (collaborations_id);

-- Add foreign keys
ALTER TABLE ONLY collaboration ADD CONSTRAINT fka2p57jvw9w13jdhex15vd4amn FOREIGN KEY (user_id) REFERENCES app_user(id);
ALTER TABLE ONLY shotlist_collaboration ADD CONSTRAINT fk_shotlist FOREIGN KEY (shotlist_id) REFERENCES shotlist(id);
ALTER TABLE ONLY shotlist_collaboration ADD CONSTRAINT fk_collaboration FOREIGN KEY (collaborations_id) REFERENCES collaboration(id);