import { Link } from "@remix-run/react";
import styled from "styled-components";

type StatProps = {
  label: string;
  value: number | string;
  to?: string;
};

export const Stat = ({ label, value, to }: StatProps) => {
  return (
    <StatWrapper>
      <h3>{label}</h3>
      {to ? <StatLink to={to}>{value}</StatLink> : <span>{value}</span>}
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

  span {
    font-weight: bold;
    font-size: 24px;
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
