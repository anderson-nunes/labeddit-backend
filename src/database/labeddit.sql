-- Active: 1702313938486@@127.0.0.1@3306
CREATE TABLE users (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

SELECT * FROM users;
DROP TABLE users;

-- INSERT INTO users(id, name, email, password, role)
-- VALUES
-- ('u001', 'Anderson', 'anderson@email.com', 'and123', 'ADMIN'),
-- ('u002', 'Patricia', 'patricia@email.com', 'pati123', 'NORMAL');

INSERT INTO users (id, name, email, password, role)
VALUES
  -- conta NORMAL e senha = "fulano123"
	('u001', 'Fulano', 'fulano@email.com', '$2a$12$kUtElOebs1Zl6CBAUc6Ndeit6M/heGgohjgYS.g6c72sbT/y.TVYK', 'NORMAL'),	
  -- conta NORMAL e senha = "beltrana00"
  ('u002', 'Beltrana', 'beltrana@email.com', '$2a$12$gO/aPYDibF3LW/X4cK2vlOHGJi/oAMFvCgU8sRe5W23vZM4oWC.Qy', 'NORMAL'),
  -- conta ADMIN e senha = "astrodev99"
	('u003', 'Astrodev', 'astrodev@email.com', '$2a$12$N86uqg4FewXtEUKNaS.yduFpkL/KS8r1iCq2/heVGOhasXaLWG7ga', 'ADMIN');


CREATE TABLE posts (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  creator_id TEXT NOT NULL,
  content TEXT NOT NULL,
  like INTEGER NOT NULL,
  dislike INTEGER NOT NULL,
  comments INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

SELECT * FROM posts;
DROP TABLE posts;

CREATE TABLE comments (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  creator_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  like INTEGER NOT NULL,
  dislike INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
  FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
);

SELECT * FROM comments;
DROP TABLE comments;

CREATE TABLE post_like_dislike (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
  FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
);

SELECT * FROM post_like_dislike;
DROP TABLE post_like_dislike;

CREATE TABLE comment_like_dislike (
  comment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
  FOREIGN KEY (comment_id) REFERENCES comments(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE 
);

SELECT * FROM comment_like_dislike;
DROP TABLE comment_like_dislike;
