import styled from 'styled-components'

import zIndices from '../zIndices'

export const ModalBody = styled.div`
  padding: 1rem;
`

const mediumScreenMaxWidth = {
  small: 300,
  medium: 500,
  large: 500,
  xlarge: 500
}

const largeScreenMaxWidth = {
  small: 300,
  medium: 500,
  large: 800,
  xlarge: 800
}

const extraLargeScreenMaxWidth = {
  small: 300,
  medium: 500,
  large: 800,
  xlarge: 1360
}

export const ModalContent = styled.div`
  width: calc(100vw - 2em);
  border: 1px solid #c8c8c8;
  border-radius: 5px;
  background: #fafafa;
  font-size: 1rem;

  @media (min-width: 576px) {
    max-width: ${props => mediumScreenMaxWidth[props.size]}px;
  }

  @media (min-width: 992px) {
    max-width: ${props => largeScreenMaxWidth[props.size]}px;
  }

  @media (min-width: 1400px) {
    max-width: ${props => extraLargeScreenMaxWidth[props.size]}px;
  }
`

export const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
`

export const ModalHeader = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
`

export const ModalTitle = styled.h2`
  margin: 0;
`

export const ModalHeaderCloseButton = styled.button`
  padding: 1rem;
  border: none;
  margin: -1rem -1rem -1rem auto;
  appearance: none;
  background: none;
  color: #0008;
  cursor: pointer;
  font-size: 16px;

  &:focus {
    color: #000;
  }

  &:hover {
    color: #000;
  }
`

export const underlayStyle = {
  boxSizing: 'border-box',
  padding: '2em 0',
  zIndex: zIndices.modal
}
