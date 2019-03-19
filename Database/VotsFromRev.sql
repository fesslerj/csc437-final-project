SELECT outerv.id, outerv.rstId, outerv.revId, outerv.prsId, outerv.voteValue, pcol.count, pcol.sum
FROM Vote outerv
JOIN (SELECT p.id, SUM(rcol.count) as count, SUM(rcol.sum) as sum
   FROM Person p
   LEFT JOIN (SELECT r.id, r.prsId, updown.count, updown.sum
      FROM Review r
      JOIN (SELECT v.revId, COUNT(v.id) AS count, SUM(v.voteValue) AS sum
         FROM Vote v
         GROUP BY v.revId) updown
      ON updown.revId = r.id) rcol
   ON rcol.prsId = p.id
   GROUP BY p.id) pcol
ON pcol.id = outerv.prsId
WHERE outerv.revId = 11
ORDER BY outerv.id;