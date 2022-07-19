import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import styled from "styled-components";

type StatProps = {
  label: string;
  value: number | string;
  to?: string;
  detail?: string;
};

// eslint-disable-next-line react/display-name
export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, to, detail }, ref) => {
    return (
      <StatWrapper ref={ref}>
        <h3>{label}</h3>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          {to ? <StatLink to={to}>{value}</StatLink> : <Value>{value}</Value>}
          {detail && <Detail>{detail}</Detail>}
        </div>
      </StatWrapper>
    );
  }
);

const StatWrapper = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    font-weight: normal;
    font-size: 14px;
    margin: 0;
  }
`;

const StatLink = styled(Link)`
  font-weight: bold;
  font-size: 24px;
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }
`;

const Value = styled.span`
  font-weight: bold;
  font-size: 24px;
  white-space: nowrap;
`;

const Detail = styled.span`
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
`;
