import type { EmployeeProfile } from "../services/employee.service";

/* Demo dataset — mirrors employee_profile + employee_status DB tables exactly.
   IDs match the seed insertion order (boot.service.ts).
   Switching to the real API only requires swapping getDemoProfile's source. */

const DEMOS: EmployeeProfile[] = [
  {
    id: 1, name: "Alex Rivera", role: "Senior Developer",
    cnic: "4210112345671", lang: ["English", "Spanish"],
    hire: "12 Mar 2020", exp: { y: 4, m: 3 },
    task: ["Backend Development", "Code Review", "System Architecture", "CI/CD Pipelines"],
    cap:  ["System Design", "API Development", "Database Optimization"],
    spec: ["Node.js", "TypeScript", "PostgreSQL"],
    gen: "Male", email: "alex.rivera@company.com",
    dob: "15 Jan 1990", ph: "+1-555-234-5678",
    addr: "42 Silicon Ave, San Francisco, CA",
    sal: 4500, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1bgJ9ObEX7Vmu2iodeu7ANsiyGaq3QqIV4cWRXrFs7iNvfixN5Pi1Bd0quN2nwqIw47xRZYRE_WzrWhIpY95KrALTGanCnM79dPhYaNbEntw6yMmqhc9yPEQMeBjjQL83NbIEAJdYjx18JZ_I7VSjZ2Rocv6HMa4IZ4yZdzdiCaRFiW5bxwaFqVEJSHL1CiynOn7vyhIM7-bWKBHQ13pcg-OGh7iAVXOyZkHm8muL1o5y52Qi9RRVShyLSHtedEfxYYYqjvqGnHMJ",
    att: 80, perf: 60, sts: null,
    shift: { in: "09:15 AM", out: null },
    initials: "AR", color: "#3B5BDB",
  },
  {
    id: 2, name: "Sarah Chen", role: "UX Designer",
    cnic: "4210298765432", lang: ["English", "Mandarin"],
    hire: "05 Jun 2021", exp: { y: 3, m: 0 },
    task: ["UI Design", "User Research", "Wireframing", "Usability Testing"],
    cap:  ["Prototyping", "Figma", "Accessibility Standards"],
    spec: ["Mobile UX", "Design Systems", "Motion Design"],
    gen: "Female", email: "sarah.chen@company.com",
    dob: "22 Aug 1993", ph: "+1-555-345-6789",
    addr: "18 Creative Way, Seattle, WA",
    sal: 5200, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    att: 80, perf: 80, sts: null,
    shift: { in: "07:50 AM", out: "04:30 PM" },
    initials: "SC", color: "#E64980",
  },
  {
    id: 3, name: "James Wilson", role: "Product Manager",
    cnic: "4210354321098", lang: ["English"],
    hire: "20 Jan 2019", exp: { y: 5, m: 6 },
    task: ["Roadmap Planning", "Stakeholder Management", "Sprint Planning", "Market Analysis"],
    cap:  ["Strategic Thinking", "Agile", "Data-Driven Decision Making"],
    spec: ["Product Strategy", "B2B SaaS", "Growth"],
    gen: "Male", email: "james.wilson@company.com",
    dob: "08 Mar 1987", ph: "+1-555-456-7890",
    addr: "305 Executive Blvd, Austin, TX",
    sal: 8000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGR-7KzB18GmbpFkcXIIJMyEUWFY775MUOd3in9mdiC64fEbW2izZElN0zMWzbAIMH_NbyLfMBMSbHw9m2538zMnueCnlKR0jPgxCp1uo9XxImLja5La8-39M4tkLlG4qH0R_wKpN1p-GDAFAugZCssgOZi2wTYqSfw3feLrw21TKm4rFZPPGWzQRyt6qt6cHUcnXNo5WvVJdiov02YET-3LvBWRQzTe3eu4wG-XzRXj1rfZ6xxMjaoyVN_XrVjQVLTPfhNp7ovBw6",
    att: 80, perf: 60, sts: null,
    shift: { in: "07:55 AM", out: "06:20 PM" },
    initials: "JW", color: "#7048E8",
  },
  {
    id: 4, name: "Elena Rodriguez", role: "Data Analyst",
    cnic: "4210476543210", lang: ["English", "Spanish"],
    hire: "10 Sep 2022", exp: { y: 1, m: 9 },
    task: ["Data Analysis", "Report Generation", "Dashboard Maintenance", "Trend Forecasting"],
    cap:  ["SQL", "Python", "Tableau"],
    spec: ["Business Intelligence", "Predictive Modeling"],
    gen: "Female", email: "elena.rodriguez@company.com",
    dob: "30 Nov 1995", ph: "+1-555-567-8901",
    addr: "77 Data Drive, Miami, FL",
    sal: 3300, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVk__1uWGE-_CAuEpIOAUKhi20HsF9WuN6Qx7TL9YYdcJVifaE1Jc_jTe-zfvjWK6DYPwnbK17Wikld6ZBfkESaJ_7FS3OQdmeM-mQgsmySemoJrnvtmCU7jz-XIdRCCIiPVRUvxEwVOP6MFN8q1Z26T5LgcEa8cl24Y48c7cblxVTXtI651wkF7h6ePBkaFDUdtMgDNPdPOc3IM4_3p9rLjIKyoyt6Tgz1_G49HYO9UwrDN9QJkykxr26tYr4Z7HtBles9yVUY4x",
    att: 90, perf: 80, sts: "leave",
    shift: null,
    initials: "ER", color: "#2B8A3E",
  },
  {
    id: 5, name: "Michael Chang", role: "Sous Chef",
    cnic: "4210565432109", lang: ["English", "Cantonese"],
    hire: "14 Apr 2021", exp: { y: 3, m: 2 },
    task: ["Meal Preparation", "Inventory Management", "Quality Control", "Menu Development"],
    cap:  ["Culinary Arts", "Kitchen Management", "Food Safety"],
    spec: ["Asian Cuisine", "Sous Vide", "Plating"],
    gen: "Male", email: "michael.chang@company.com",
    dob: "17 Jun 1988", ph: "+1-555-678-9012",
    addr: "12 Culinary St, Chicago, IL",
    sal: 4800, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLTNppDitBL-LUEeaxBCqc0mH7i9QNK5oXjv0WIk341piN1t1jbHb_IiDU04tNJlovS2b8M761eF09xTFFthfLHinU7eKP65ofovLvikYSEaSPFseO02sWYQYARhRoo15vG0yN0jewg5gcaa4fxf_-cBnElNRwmC-4YfqjKa4FVucFFkp18q_EIMojqUWDtPykXs7ZeaGL_RSlhAx2Jywp_otPpLFm3B-H1sXV4W6-Cc3RxMQQeW07COmY1OMZQf-BYyLCBrNKo",
    att: 95, perf: 85, sts: "unauth",
    shift: null,
    initials: "MC", color: "#C92A2A",
  },
  {
    id: 6, name: "Olivia Smith", role: "Restaurant Manager",
    cnic: "4210687654321", lang: ["English", "French"],
    hire: "01 Feb 2018", exp: { y: 6, m: 5 },
    task: ["Staff Management", "Customer Service", "Budget Planning", "Vendor Relations"],
    cap:  ["Leadership", "Operations", "Conflict Resolution"],
    spec: ["Hospitality Management", "Fine Dining", "Event Coordination"],
    gen: "Female", email: "olivia.smith@company.com",
    dob: "25 Apr 1985", ph: "+1-555-789-0123",
    addr: "88 Hospitality Row, New York, NY",
    sal: 6000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn9FUaoKfhISyk0i7541LCL_Wne8GVJqIZ5Kh4R4-k1T2CNR9nrJseDhLdCVFn0IVlGMCi3ObqXLAW1heQFm2c3UAy58EAoLwiIvUyFxWlz0MnUYbGctN9HdTwRXf0JXR5U-IMcikQ6OzWsuSLyz8xCd74xF4ZOlicwh4v0K4Wntug0_hOAQg190FMP14qIg74oI478NPbXIiNLNjMhaIrWFNdZrVKsLWc7eTn_715wWnZK8ESsznSD5kJOA_BmCV3zQcCgm1s5-S5r",
    att: 100, perf: 90, sts: null,
    shift: { in: "07:30 AM", out: "06:30 PM" },
    initials: "OS", color: "#1098AD",
  },
];

const BY_ID = new Map(DEMOS.map(d => [d.id, d]));

/** Look up demo profile by employee id.
    Returns null if not found — callers treat null as "no extra profile data". */
export function getDemoProfile(id: number): EmployeeProfile | null {
  return BY_ID.get(id) ?? null;
}
