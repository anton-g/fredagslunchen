import styled from "styled-components";

type StatProps = {
  label: string;
  value: number | string;
};

export const Stat = ({ label, value }: StatProps) => {
  return (
    <StatWrapper>
      <h3>{label}</h3>
      <span>{value}</span>
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
