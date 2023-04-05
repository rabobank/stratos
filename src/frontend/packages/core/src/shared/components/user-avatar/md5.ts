export class MD5 {
  private static _string: string;
  private static x: Array<number> = <Array<number>>Array();
  private static k: number;
  private static AA: number;
  private static BB: number;
  private static CC: number;
  private static DD: number;
  private static a: number;
  private static b: number;
  private static c: number;
  private static d: number;
  private static S11 = 7;
  private static S12 = 12;
  private static S13 = 17;
  private static S14 = 22;
  private static S21 = 5;
  private static S22 = 9;
  private static S23 = 14;
  private static S24 = 20;
  private static S31 = 4;
  private static S32 = 11;
  private static S33 = 16;
  private static S34 = 23;
  private static S41 = 6;
  private static S42 = 10;
  private static S43 = 15;
  private static S44 = 21;

  private static RotateLeft: Function = (
    lValue: number,
    iShiftBits: number
  ): number => (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));

  private static AddUnsigned(lX: number, lY: number): number {
    let lX4: number, lY4: number, lX8: number, lY8: number, lResult: number;

    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);

    if (!!(lX4 & lY4)) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }

    if (!!(lX4 | lY4)) {
      if (!!(lResult & 0x40000000)) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  private static F: Function = (x: number, y: number, z: number): number =>
    (x & y) | (~x & z);

  private static G: Function = (x: number, y: number, z: number): number =>
    (x & z) | (y & ~z);

  private static H: Function = (x: number, y: number, z: number): number =>
    x ^ y ^ z;

  private static I: Function = (x: number, y: number, z: number): number =>
    y ^ (x | ~z);

  private static FF(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = this.AddUnsigned(
      a,
      this.AddUnsigned(this.AddUnsigned(this.F(b, c, d), x), ac)
    );
    return this.AddUnsigned(this.RotateLeft(a, s), b);
  }

  private static GG(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = this.AddUnsigned(
      a,
      this.AddUnsigned(this.AddUnsigned(this.G(b, c, d), x), ac)
    );
    return this.AddUnsigned(this.RotateLeft(a, s), b);
  }

  private static HH(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = this.AddUnsigned(
      a,
      this.AddUnsigned(this.AddUnsigned(this.H(b, c, d), x), ac)
    );
    return this.AddUnsigned(this.RotateLeft(a, s), b);
  }

  private static II(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = this.AddUnsigned(
      a,
      this.AddUnsigned(this.AddUnsigned(this.I(b, c, d), x), ac)
    );
    return this.AddUnsigned(this.RotateLeft(a, s), b);
  }

  private static ConvertToWordArray(string: string): Array<number> {
    let lWordCount: number,
      lMessageLength: number = string.length,
      lNumberOfWords_temp1: number = lMessageLength + 8,
      lNumberOfWords_temp2: number =
        (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
      lNumberOfWords: number = (lNumberOfWords_temp2 + 1) * 16,
      lWordArray: Array<number> = Array(lNumberOfWords - 1),
      lBytePosition = 0,
      lByteCount = 0;

    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] |
        (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }

    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

    return lWordArray;
  }

  private static WordToHex(lValue: number): string {
    let WordToHexValue = '',
      WordToHexValue_temp = '',
      lByte: number,
      lCount: number;

    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue =
        WordToHexValue +
        WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }

    return WordToHexValue;
  }

  private static Utf8Encode(string: string): string {
    let utftext = '',
      c: number;

    string = string.replace(/\r\n/g, '\n');

    for (let n = 0; n < string.length; n++) {
      c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  public static hash(string: any): string {
    let temp: string;

    if (typeof string !== 'string') string = JSON.stringify(string);

    this._string = this.Utf8Encode(string);
    this.x = this.ConvertToWordArray(this._string);

    this.a = 0x67452301;
    this.b = 0xefcdab89;
    this.c = 0x98badcfe;
    this.d = 0x10325476;

    for (this.k = 0; this.k < this.x.length; this.k += 16) {
      this.AA = this.a;
      this.BB = this.b;
      this.CC = this.c;
      this.DD = this.d;
      this.a = this.FF(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k],
        this.S11,
        0xd76aa478
      );
      this.d = this.FF(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 1],
        this.S12,
        0xe8c7b756
      );
      this.c = this.FF(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 2],
        this.S13,
        0x242070db
      );
      this.b = this.FF(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 3],
        this.S14,
        0xc1bdceee
      );
      this.a = this.FF(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 4],
        this.S11,
        0xf57c0faf
      );
      this.d = this.FF(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 5],
        this.S12,
        0x4787c62a
      );
      this.c = this.FF(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 6],
        this.S13,
        0xa8304613
      );
      this.b = this.FF(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 7],
        this.S14,
        0xfd469501
      );
      this.a = this.FF(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 8],
        this.S11,
        0x698098d8
      );
      this.d = this.FF(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 9],
        this.S12,
        0x8b44f7af
      );
      this.c = this.FF(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 10],
        this.S13,
        0xffff5bb1
      );
      this.b = this.FF(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 11],
        this.S14,
        0x895cd7be
      );
      this.a = this.FF(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 12],
        this.S11,
        0x6b901122
      );
      this.d = this.FF(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 13],
        this.S12,
        0xfd987193
      );
      this.c = this.FF(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 14],
        this.S13,
        0xa679438e
      );
      this.b = this.FF(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 15],
        this.S14,
        0x49b40821
      );
      this.a = this.GG(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 1],
        this.S21,
        0xf61e2562
      );
      this.d = this.GG(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 6],
        this.S22,
        0xc040b340
      );
      this.c = this.GG(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 11],
        this.S23,
        0x265e5a51
      );
      this.b = this.GG(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k],
        this.S24,
        0xe9b6c7aa
      );
      this.a = this.GG(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 5],
        this.S21,
        0xd62f105d
      );
      this.d = this.GG(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 10],
        this.S22,
        0x2441453
      );
      this.c = this.GG(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 15],
        this.S23,
        0xd8a1e681
      );
      this.b = this.GG(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 4],
        this.S24,
        0xe7d3fbc8
      );
      this.a = this.GG(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 9],
        this.S21,
        0x21e1cde6
      );
      this.d = this.GG(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 14],
        this.S22,
        0xc33707d6
      );
      this.c = this.GG(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 3],
        this.S23,
        0xf4d50d87
      );
      this.b = this.GG(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 8],
        this.S24,
        0x455a14ed
      );
      this.a = this.GG(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 13],
        this.S21,
        0xa9e3e905
      );
      this.d = this.GG(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 2],
        this.S22,
        0xfcefa3f8
      );
      this.c = this.GG(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 7],
        this.S23,
        0x676f02d9
      );
      this.b = this.GG(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 12],
        this.S24,
        0x8d2a4c8a
      );
      this.a = this.HH(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 5],
        this.S31,
        0xfffa3942
      );
      this.d = this.HH(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 8],
        this.S32,
        0x8771f681
      );
      this.c = this.HH(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 11],
        this.S33,
        0x6d9d6122
      );
      this.b = this.HH(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 14],
        this.S34,
        0xfde5380c
      );
      this.a = this.HH(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 1],
        this.S31,
        0xa4beea44
      );
      this.d = this.HH(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 4],
        this.S32,
        0x4bdecfa9
      );
      this.c = this.HH(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 7],
        this.S33,
        0xf6bb4b60
      );
      this.b = this.HH(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 10],
        this.S34,
        0xbebfbc70
      );
      this.a = this.HH(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 13],
        this.S31,
        0x289b7ec6
      );
      this.d = this.HH(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k],
        this.S32,
        0xeaa127fa
      );
      this.c = this.HH(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 3],
        this.S33,
        0xd4ef3085
      );
      this.b = this.HH(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 6],
        this.S34,
        0x4881d05
      );
      this.a = this.HH(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 9],
        this.S31,
        0xd9d4d039
      );
      this.d = this.HH(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 12],
        this.S32,
        0xe6db99e5
      );
      this.c = this.HH(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 15],
        this.S33,
        0x1fa27cf8
      );
      this.b = this.HH(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 2],
        this.S34,
        0xc4ac5665
      );
      this.a = this.II(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k],
        this.S41,
        0xf4292244
      );
      this.d = this.II(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 7],
        this.S42,
        0x432aff97
      );
      this.c = this.II(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 14],
        this.S43,
        0xab9423a7
      );
      this.b = this.II(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 5],
        this.S44,
        0xfc93a039
      );
      this.a = this.II(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 12],
        this.S41,
        0x655b59c3
      );
      this.d = this.II(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 3],
        this.S42,
        0x8f0ccc92
      );
      this.c = this.II(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 10],
        this.S43,
        0xffeff47d
      );
      this.b = this.II(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 1],
        this.S44,
        0x85845dd1
      );
      this.a = this.II(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 8],
        this.S41,
        0x6fa87e4f
      );
      this.d = this.II(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 15],
        this.S42,
        0xfe2ce6e0
      );
      this.c = this.II(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 6],
        this.S43,
        0xa3014314
      );
      this.b = this.II(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 13],
        this.S44,
        0x4e0811a1
      );
      this.a = this.II(
        this.a,
        this.b,
        this.c,
        this.d,
        this.x[this.k + 4],
        this.S41,
        0xf7537e82
      );
      this.d = this.II(
        this.d,
        this.a,
        this.b,
        this.c,
        this.x[this.k + 11],
        this.S42,
        0xbd3af235
      );
      this.c = this.II(
        this.c,
        this.d,
        this.a,
        this.b,
        this.x[this.k + 2],
        this.S43,
        0x2ad7d2bb
      );
      this.b = this.II(
        this.b,
        this.c,
        this.d,
        this.a,
        this.x[this.k + 9],
        this.S44,
        0xeb86d391
      );

      this.a = this.AddUnsigned(this.a, this.AA);
      this.b = this.AddUnsigned(this.b, this.BB);
      this.c = this.AddUnsigned(this.c, this.CC);
      this.d = this.AddUnsigned(this.d, this.DD);
    }

    temp =
      this.WordToHex(this.a) +
      this.WordToHex(this.b) +
      this.WordToHex(this.c) +
      this.WordToHex(this.d);
    return temp.toLowerCase();
  }
}
