import { render } from "@testing-library/react";
import Loading from "../../components/Loading";
import { expect, test } from "vitest";

test("renders without crashing", () => {
    render(<Loading />);
})

test("matches snapshot", () => {
    const { asFragment } = render(<Loading />);
    expect(asFragment()).toMatchSnapshot();
})