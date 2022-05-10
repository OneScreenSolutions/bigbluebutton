import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  pollInputHeight
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGrayLight,
  colorHeading
} from '/imports/ui/stylesheets/styled-components/palette';
const DownloadPollStatsButton = styled(Button)`
  border: solid ${colorGrayLight} 1px;
  min-height: ${pollInputHeight};
  font-size: ${fontSizeBase};
  white-space: pre-wrap;
  width: 100%;
  border-top: none;
  border-top-left-radius:0;
  border-top-right-radius:0;
  & > span {
    &:hover {
      opacity: 1;
    }
  }

  ${({ small }) => small && `
    width: 49% !important;
  `}

  ${({ full }) => full && `
    width: 100%;
  `}
`;
const PreviewModalContainer = styled.div`
  padding: 1rem;
  padding-top: 2rem; 
  padding-bottom: 0;
`
const ModalHeading = styled.h4`
  margin-top: 1rem;
  font-weight: 600;
  color: ${colorHeading};
`;

export default {
  DownloadPollStatsButton,
  PreviewModalContainer,
  ModalHeading
};
