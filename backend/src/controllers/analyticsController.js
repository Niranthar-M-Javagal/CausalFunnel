import Event from '../models/Event.js';

const VALID_EVENT_TYPES = ['page_view', 'click'];

/**
 * @desc    Receive and store an analytics event
 * @route   POST /api/events
 * @access  Public
 */
export const trackEvent = async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      pageUrl,
      timestamp,
      x,
      y,
      viewportWidth,
      viewportHeight,
    } = req.body;

    if (!sessionId || !eventType || !pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, eventType, and pageUrl are required.',
      });
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eventType. Allowed values: page_view, click.',
      });
    }

    if (
      typeof viewportWidth !== 'number' ||
      typeof viewportHeight !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'viewportWidth and viewportHeight must be numbers.',
      });
    }

    if (eventType === 'click') {
      if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Click events require numeric x and y coordinates.',
        });
      }
    }

    const newEvent = await Event.create({
      sessionId,
      eventType,
      pageUrl,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x: eventType === 'click' ? x : undefined,
      y: eventType === 'click' ? y : undefined,
      viewportWidth,
      viewportHeight,
    });

    return res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    console.error(`[Track Event Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to store analytics event.',
    });
  }
};

/**
 * @desc    Fetch all sessions with event summary stats
 * @route   GET /api/sessions
 * @access  Public
 */
export const getSessionsList = async (req, res) => {
  try {
    const summaries = await Event.aggregate([
      {
        $group: {
          _id: '$sessionId',
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0],
            },
          },
          clicks: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0],
            },
          },
          startedAt: { $min: '$timestamp' },
          endedAt: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          sessionId: '$_id',
          totalEvents: 1,
          pageViews: 1,
          clicks: 1,
          startedAt: 1,
          endedAt: 1,
        },
      },
      { $sort: { startedAt: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: summaries,
    });
  } catch (error) {
    console.error(`[Get Sessions Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions.',
    });
  }
};

/**
 * @desc    Fetch ordered event timeline for a session
 * @route   GET /api/sessions/:sessionId/events
 * @access  Public
 */
export const getSessionTimeline = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chronologicalEvents = await Event.find({ sessionId }).sort({
      timestamp: 1,
    });

    return res.status(200).json({
      success: true,
      data: chronologicalEvents,
    });
  } catch (error) {
    console.error(`[Get Session Timeline Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch session timeline.',
    });
  }
};

/**
 * @desc    Fetch click coordinates for a page
 * @route   GET /api/heatmap?pageUrl=...
 * @access  Public
 */
export const getHeatmapData = async (req, res) => {
  try {
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'pageUrl query parameter is required.',
      });
    }

    const clickPlots = await Event.find(
      { pageUrl, eventType: 'click' },
      {
        _id: 0,
        x: 1,
        y: 1,
        viewportWidth: 1,
        viewportHeight: 1,
        timestamp: 1,
      }
    ).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      data: clickPlots,
    });
  } catch (error) {
    console.error(`[Get Heatmap Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data.',
    });
  }
};