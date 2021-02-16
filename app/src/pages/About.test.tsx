import * as React from "react";

import { render, RenderResult } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { About } from "./About";

describe("<About>", () => {
  let wrapper: RenderResult;

  beforeEach(() => {
    wrapper = render(<About />);
  });

  it("should render doi of dataset", () => {
    expect(wrapper.baseElement).toHaveTextContent("10.5281/zenodo.3736430");
  });
});
