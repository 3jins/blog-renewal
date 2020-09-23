import { MemberDoc } from '../model/Member';

interface MemberRepository {
  create(name: string): MemberDoc;
  delete(memberNo: number);
}
