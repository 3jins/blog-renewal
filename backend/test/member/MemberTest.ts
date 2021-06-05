import { ClientSession } from 'mongoose';
import Member from '@src/member/Member';
import { common as commonTestData } from '@test/data/testData';

export default (session: ClientSession) => ({
  createTest: async () => {
    await Member.insertMany([commonTestData.masterMember], { session });

    const results = await Member
      .find({ memberNo: commonTestData.masterMember.memberNo })
      .session(session);
    results.should.have.length(1);
    const result = results[0];
    const re = new RegExp('[a-f0-9]{24}');
    re.test(result._id).should.be.true;
    result.memberNo.should.equal(commonTestData.masterMember.memberNo);
    result.name.should.equal(commonTestData.masterMember.name);
  },
});
