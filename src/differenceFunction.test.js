import { calculateDiff } from "./differences";

//example 1 test
import obj1 from "./example1_test/obj1.json";
import obj2 from "./example1_test/obj2.json";
import output1 from "./example1_test/output1.json";

//example 2 test
import obj3 from "./example2_test/obj3.json";
import obj4 from "./example2_test/obj4.json";
import output2 from "./example2_test/output2.json";

//example 3 test
import obj5 from "./example3_test/obj5.json";
import obj6 from "./example3_test/obj6.json";
import output3 from "./example3_test/output3.json";

//example 4 test 
import obj7 from "./example4_test/obj7.json";
import obj8 from "./example4_test/obj8.json";
import output4 from "./example4_test/output4.json";

//example 5 test
import obj9 from "./example5_test/obj9.json";
import obj10 from "./example5_test/obj10.json";
import output5 from "./example5_test/output5.json";

//example 6 test
import obj11 from "./example6_test/obj11.json";
import obj12 from "./example6_test/obj12.json";
import output6 from "./example6_test/output6.json";


//test 1
it('example 1 test', () => {
  let calculateDiffResult = calculateDiff(obj1, obj2);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output1));
});

//test 2
it('example 2 test', () => {
  let calculateDiffResult = calculateDiff(obj3, obj4);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output2));
});

//test 3
it('example 3 test', () => {
  let calculateDiffResult = calculateDiff(obj5, obj6);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output3));
});

//test 4
it('example 4 test', () => {
  let calculateDiffResult = calculateDiff(obj7, obj8);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output4));
});

//test 5
it('example 5 test', () => {
  let calculateDiffResult = calculateDiff(obj9, obj10);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output5));
});

//test 6
it('example 6 test', () => {
  let calculateDiffResult = calculateDiff(obj11, obj12);
  expect(JSON.stringify(calculateDiffResult)).toBe(JSON.stringify(output6));
});
