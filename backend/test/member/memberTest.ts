import { ClientSession } from 'mongoose';
import { common as commonTestData } from '../data/testData';
import Member from '../../src/member/Member';

export default (session: ClientSession) => ({
  createTest: async () => {
    await Member.create([commonTestData.masterMember], { session });

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