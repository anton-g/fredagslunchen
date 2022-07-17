import { Link } from "@remix-run/react";
import styled from "styled-components";
import { Spacer } from "./Spacer";

type StatProps = {
  label: string;
  value: number | string;
  to?: string;
  detail?: string;
};

export const Stat = ({ label, value, to, detail }: StatProps) => {
  return (
    <StatWrapper>
      <h3>{label}</h3>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        {to ? <StatLink to={to}>{value}</StatLink> : <Value>{value}</Value>}
        {detail && <Detail>{detail}</Detail>}
      </div>
    </StatWrapper>
  );
};

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
`;

const Detail = styled.span`
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
`;
