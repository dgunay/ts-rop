import { Option, none } from "../Option";

type Thing = string;
function findThing(): Option<Thing> {
  return none(); // oops we didn't find it
}

function optionToResult() {
  findThing().okOrElse(() => {
    // we can do whatever we want here if it isn't found
  });

  // e.g. if we just want to throw it
  findThing().expect("oops");

  // e.g. if we want to log it
  findThing().okOrElse(() => console.error("oops"));
}
