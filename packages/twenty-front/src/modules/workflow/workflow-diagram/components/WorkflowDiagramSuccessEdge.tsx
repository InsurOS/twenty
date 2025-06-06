import { EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerWidthPx';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from '@xyflow/react';
import { Label } from 'twenty-ui/display';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';

const StyledLabel = styled(Label)`
  color: ${({ theme }) => theme.tag.text.turquoise};
`;

type WorkflowDiagramSuccessEdgeProps = EdgeProps;

export const WorkflowDiagramSuccessEdge = ({
  sourceY,
  targetY,
  markerStart,
  markerEnd,
  label,
}: WorkflowDiagramSuccessEdgeProps) => {
  const theme = useTheme();

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.tag.text.turquoise }}
      />

      <EdgeLabelRenderer>
        <StyledLabel
          variant="small"
          style={{
            position: 'absolute',
            transform: `translate(0, -50%) translate(${labelX}px, ${labelY}px) translateX(${EDGE_GREEN_ROUNDED_ARROW_MARKER_WIDTH_PX / 2 + 3}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {label}
        </StyledLabel>
      </EdgeLabelRenderer>
    </>
  );
};
