import styled from 'styled-components'

export const TooltipHint = styled.span`
  background-image: linear-gradient(to right, #000 75%, transparent 75%);
  background-position: 0 1.15em;
  background-size: 4px 2px;
  background-repeat: repeat-x;

  @media print {
    background-image: none;
  }
`
