DROP TABLE IF EXISTS hackers CASCADE;

CREATE TABLE hackers
(
   id        serial         NOT NULL,
   nickname  char(16),
   quiz_id   integer,
   answers   varchar(256)
);

-- Column id is associated with sequence public.hackers_id_seq

ALTER TABLE hackers
   ADD CONSTRAINT hackers_pkey
   PRIMARY KEY (id);

COMMIT;

DROP SEQUENCE IF EXISTS hackers_id_seq;

CREATE SEQUENCE hackers_id_seq
       INCREMENT BY 1
       MINVALUE 1
       CACHE 1
       NO CYCLE
       OWNED BY hackers.id;

COMMIT;

DROP TABLE IF EXISTS quizzes CASCADE;

CREATE TABLE quizzes
(
   id            serial         NOT NULL,
   name          varchar(512),
   questions     text,
   access_token  varchar(128)
);

-- Column id is associated with sequence public.quizzes_id_seq

ALTER TABLE quizzes
   ADD CONSTRAINT quizzes_pkey
   PRIMARY KEY (id);

COMMIT;

DROP SEQUENCE IF EXISTS quizzes_id_seq;

CREATE SEQUENCE quizzes_id_seq
       INCREMENT BY 1
       MINVALUE 1
       CACHE 1
       NO CYCLE
       OWNED BY quizzes.id;

COMMIT;
