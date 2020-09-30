import { MemberDoc } from '../Member';

interface MemberRepository {
  create(name: string): MemberDoc;
  delete(memberNo: number);
}
