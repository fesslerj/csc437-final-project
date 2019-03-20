SELECT hyrev.id, hyrev.firstName, hyrev.lastName, hyrev.whenMade, hyrev.email,
hyrev.content, hyrev.rating, hyrev.ownerResponseWhenMade,
hyrev.ownerResponseContent, supcol.prsId AS supcolPrsId, supcol.voteValue, supcol.count, supcol.sum
FROM (SELECT rrr.id, ppp.firstName, ppp.lastName, rrr.whenMade, ppp.email,
      rrr.content, rrr.rating, rrr.ownerResponseWhenMade,
      rrr.ownerResponseContent FROM Review rrr join Person ppp on
      rrr.prsId = ppp.id where rrr.rstId = 1
      
      ORDER BY rrr.whenMade ASC, rrr.id ASC) hyrev
LEFT JOIN (SELECT outerv.id, outerv.rstId, outerv.revId, outerv.prsId, outerv.voteValue, pcol.count, pcol.sum
FROM Vote outerv
JOIN (SELECT p.id, SUM(rcol.count) as count, SUM(rcol.sum) as sum
FROM Person p
LEFT JOIN (SELECT r.id, r.prsId, updown.count, updown.sum
FROM Review r
JOIN (SELECT v.revId, COUNT(v.id) AS count, SUM(v.voteValue) AS sum
FROM Vote v
GROUP BY v.revId) updown ON updown.revId = r.id) rcol ON rcol.prsId = p.id
GROUP BY p.id) pcol ON pcol.id = outerv.prsId
ORDER BY outerv.id, outerv.rstId, outerv.prsId) supcol ON supcol.revId = hyrev.id
ORDER BY hyrev.id ASC, hyrev.id ASC, supcol.prsId ASC;