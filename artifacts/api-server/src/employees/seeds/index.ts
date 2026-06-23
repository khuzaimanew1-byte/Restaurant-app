/* Employee seed data — inserted on first boot when the DB is empty.
   SSOT: only this file holds demo employee records.
   Never import this in any UI component — server-side only.          */

export interface ProfileSeed {
  name: string; role: string; cnic: string; sal: number; gen: string;
  img:  string; lang: string[]; task: string[]; cap: string[]; spec: string[];
}

export interface StatusSeed {
  att:   number;
  perf:  number;
  sts:   "leave" | "unauth" | "late" | null;
  shift: { in?: string; out?: string } | null;
}

export const PROFILE_SEEDS: ProfileSeed[] = [
  {
    name: "Alex Rivera", role: "Senior Developer", cnic: "4210112345671",
    sal: 4500, gen: "Male",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ",
    lang: ["English", "Spanish"], task: ["Backend Development", "Code Review"],
    cap: ["System Design", "API Development"], spec: ["Node.js", "TypeScript"],
  },
  {
    name: "Sarah Chen", role: "UX Designer", cnic: "4210298765432",
    sal: 5200, gen: "Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    lang: ["English", "Mandarin"], task: ["UI Design", "User Research"],
    cap: ["Prototyping", "Figma"], spec: ["Mobile UX", "Design Systems"],
  },
  {
    name: "James Wilson", role: "Product Manager", cnic: "4210354321098",
    sal: 8000, gen: "Male",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",
    lang: ["English"], task: ["Roadmap Planning", "Stakeholder Management"],
    cap: ["Strategic Thinking", "Agile"], spec: ["Product Strategy"],
  },
  {
    name: "Elena Rodriguez", role: "Data Analyst", cnic: "4210476543210",
    sal: 3300, gen: "Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x",
    lang: ["English", "Spanish"], task: ["Data Analysis", "Report Generation"],
    cap: ["SQL", "Python"], spec: ["Business Intelligence"],
  },
  {
    name: "Michael Chang", role: "Sous Chef", cnic: "4210565432109",
    sal: 4800, gen: "Male",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJlovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",
    lang: ["English", "Cantonese"], task: ["Meal Preparation", "Inventory Management"],
    cap: ["Culinary Arts", "Kitchen Management"], spec: ["Asian Cuisine"],
  },
  {
    name: "Olivia Smith", role: "Restaurant Manager", cnic: "4210687654321",
    sal: 6000, gen: "Female",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    lang: ["English", "French"], task: ["Staff Management", "Customer Service"],
    cap: ["Leadership", "Operations"], spec: ["Hospitality Management"],
  },
];

export const STATUS_SEEDS: StatusSeed[] = [
  { att: 80,  perf: 60, sts: null,     shift: { in: "09:15 AM" }                  },
  { att: 80,  perf: 80, sts: null,     shift: { in: "07:50 AM", out: "04:30 PM" } },
  { att: 80,  perf: 60, sts: null,     shift: { in: "07:55 AM", out: "06:20 PM" } },
  { att: 90,  perf: 80, sts: "leave",  shift: null                                 },
  { att: 95,  perf: 85, sts: "unauth", shift: null                                 },
  { att: 100, perf: 90, sts: null,     shift: { in: "07:30 AM", out: "06:30 PM" } },
];
