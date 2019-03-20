var Voting = {};

Voting.GetBin = function(count, sum) {
   var ramp;
   var rawBin;

   count = count || 0;
   sum = sum || 0;

   ramp = (count < 1 ? 1 : (count > 10 ? 10 : count)) / 10.0;

   if (!count && !sum)
      count = 1;

   rawBin = (1.0*sum)/(1.0*count); // -1.0 <--> 1.0

   rawBin = (2.5 * (rawBin + 1.0)); // 0.0 <--> 5.0

   return (rawBin / 5.0) * ramp; // 0.0 <--> 1.0
};

Voting.WeightVote = function(voteObj) {
   voteObj = voteObj || {};
   var rawVote = (voteObj.voteValue || 0);
   var vCnt = voteObj.count;
   var vSum = voteObj.sum;

   var bin = Voting.GetBin(vCnt, vSum);
   return rawVote * bin;
};

Voting.WeightedVoteReducer = function(acc, cur) {
   return Voting.WeightVote(cur) + acc;
}

module.exports = Voting;
