import { transparentize } from 'polished'
import { PropTypes } from 'prop-types'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Tab, TabPanel, TabList, Tabs as BaseTabs } from 'react-tabs'

const activeTabColor = '#428bca'
const inactiveTabColor = '#e0e0e0'

const StyledTabList = styled(TabList)`
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  padding: 0;
  border-bottom: 1px solid #e0e0e0;
  margin: 0;
  list-style-type: none;
`

const StyledTab = styled(Tab)`
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  outline: none;
  cursor: pointer;

  &:focus {
    box-shadow: 0 0 0 0.2em ${transparentize(0.5, activeTabColor)};
  }
`

/* We split TabLabel like this, rather than having TabLabel be a styled.div
 * directly, because React gets angry if you pass a non-DOM prop such as
 * isActive to a DOM component such as a div. TabLabel being a
 * styled(BaseTabLabel) lets us work around that. */

// eslint-disable-next-line react/prop-types
const BaseTabLabel = ({ isActive, ...props }) => <div {...props} />
const TabLabel = styled(BaseTabLabel)`
  box-sizing: border-box;
  padding: 0.375em 0.75em;
  border-color: ${props => (props.isActive ? activeTabColor : inactiveTabColor)};
  border-style: solid;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  border-width: 1px 1px 0 1px;
  color: ${props => (props.isActive ? activeTabColor : 'inherit')};
`

const TabPanelWrapper = styled.div`
  padding: 0.5em;
`

export const Tabs = props => {
  const { tabs } = props
  const onChange = props.onChange || (() => {})

  const [activeTabState, setActiveTabState] = useState(tabs[0].id)
  const activeTabId = props.activeTabId || activeTabState

  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabId)
  const onSelect = newTabIndex => {
    const newTabId = tabs[newTabIndex].id
    setActiveTabState(newTabId)
    onChange(newTabId)
  }

  return (
    <BaseTabs selectedIndex={activeTabIndex} onSelect={onSelect}>
      <StyledTabList>
        {tabs.map((tab, tabIndex) => {
          const isActive = tabIndex === activeTabIndex
          return (
            <StyledTab key={tab.id}>
              <TabLabel isActive={isActive}>{tab.label}</TabLabel>
            </StyledTab>
          )
        })}
      </StyledTabList>
      <TabPanelWrapper>
        {tabs.map(tab => (
          <TabPanel key={tab.id}>{tab.render()}</TabPanel>
        ))}
      </TabPanelWrapper>
    </BaseTabs>
  )
}

Tabs.propTypes = {
  activeTabId: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func
}

Tabs.defaultProps = {
  activeTabId: undefined,
  onChange: () => {}
}
