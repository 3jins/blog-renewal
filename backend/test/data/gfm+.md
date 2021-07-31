이것은 테스트를 위한 파일입니다.

## ul/li

### only plain text
- level 1
  - level 2
  - level 2
    여기다가 평문 한 번 박고 가실게요 ^^
  - level 2
    - level 3

### with other elements
아래 테이블, 이미지 등에서 계속 테스트하므로 생략

## 테이블
테이블은 외래어기 때문에 악마(evil)가 아니라 가능(able)으로 봐야 한다.

### list indentation 없음 / 2 x 3
| No | name | description |
|:-|:-:|---|
|1|네이버| 좋은 회사|
|2|카카오|덜 좋은 회사|

### list indentation 1단계 (2 spaces) / 2 x 3
- level 1
  | No | name | description |
  |:-|:-:|---|
  |1|네이버| 좋은 회사|
  |2|카카오|덜 좋은 회사|

## 강조문법
강하게 조문하는 방법이 아니다. 강조의 문법이다.

### bold
Lilac 앨범은 **이지은(아이유, IU)**의 작품이다.
원래 **bold 문법**은 이렇게 쓰는 것이니 디버깅할 때 참고쓰.
그리고 **이렇게** 단독으로 떨어진 단어도 렌더링돼야 하니 확인쓰.

### italic
Lilac 앨범은 *이지은(아이유, IU)*의 작품이다.
원래 *italic 문법*은 이렇게 쓰는 것이니 디버깅할 때 참고쓰.
그리고 *이렇게* 단독으로 떨어진 단어도 렌더링돼야 하니 확인쓰.

### bold and italic
Lilac 앨범은 ***이지은(아이유, IU)***의 작품이다.
원래 ***bold and italic 문법***은 이렇게 쓰는 것이니 디버깅할 때 참고쓰.
그리고 ***이렇게*** 단독으로 떨어진 단어도 렌더링돼야 하니 확인쓰.

### strike-out
Lilac 앨범은 ~~이지금(아이유, IU)~~의 작품이다.
원래 ~~strike-out 문법~~은 이렇게 쓰는 것이니 디버깅할 때 참고쓰.
그리고 ~~이렇게~~ 단독으로 떨어진 단어도 렌더링돼야 하니 확인쓰.

### should be excluded in code blocks
```c
#include <stdio.h>

int main() {
  /* C 놓은지 3년이 다 돼가서 포인터 이렇게 쓰는거 맞는지 모르겠음..;; */
  int a = 1;
  int* ptr = a;
  return 0;
}
```

### should be excluded in inline code
Java에서 주석은 `/*이런 식으로*/` 사용하는데, 저게 이탤릭으로 렌더링되면 난감하다.

## Raw HTML

### list indentation 없음
<figure>
  <img src="../iu-clap.gif" width = "20%"/>
  <figcaption>징짱</figcaption>
</figure>

### list indentation 1단계 (2 spaces) 
- level 1
  <figure>
    <img src="../iu-clap.gif" width = "20%"/>
    <figcaption>징짱</figcaption>
  </figure>

## New Lines

### single new line between normal lines
라인1
라인2

### two new lines between normal lines
라인1

라인2

### three new lines between normal lines
라인1


라인2
