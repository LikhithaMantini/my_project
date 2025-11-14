import React from 'react';

const SlideLayouts = ({ onSelectLayout }) => {
  const layouts = [
    {
      id: 'title',
      name: 'Title Slide',
      thumbnail: (
        <div className="layout-thumbnail title-layout">
          <div className="layout-title">Click to add title</div>
          <div className="layout-subtitle">Click to add subtitle</div>
        </div>
      )
    },
    {
      id: 'title-content',
      name: 'Title and Content',
      thumbnail: (
        <div className="layout-thumbnail title-content-layout">
          <div className="layout-title">Click to add title</div>
          <div className="layout-content">
            <div className="content-line"></div>
            <div className="content-line"></div>
            <div className="content-line"></div>
          </div>
        </div>
      )
    },
    {
      id: 'section-header',
      name: 'Section Header',
      thumbnail: (
        <div className="layout-thumbnail section-header-layout">
          <div className="section-title">SECTION</div>
          <div className="layout-title">Click to add title</div>
        </div>
      )
    },
    {
      id: 'two-content',
      name: 'Two Content',
      thumbnail: (
        <div className="layout-thumbnail two-content-layout">
          <div className="layout-title">Click to add title</div>
          <div className="content-columns">
            <div className="content-column">
              <div className="content-line"></div>
              <div className="content-line"></div>
            </div>
            <div className="content-divider"></div>
            <div className="content-column">
              <div className="content-line"></div>
              <div className="content-line"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'comparison',
      name: 'Comparison',
      thumbnail: (
        <div className="layout-thumbnail comparison-layout">
          <div className="layout-title">Click to add title</div>
          <div className="comparison-content">
            <div className="comparison-column">
              <div className="comparison-title">COMPARISON</div>
              <div className="content-line"></div>
              <div className="content-line"></div>
            </div>
            <div className="comparison-column">
              <div className="comparison-title">COMPARISON</div>
              <div className="content-line"></div>
              <div className="content-line"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'blank',
      name: 'Blank',
      thumbnail: <div className="layout-thumbnail blank-layout"></div>
    }
  ];

  return (
    <div className="slide-layouts-container">
      <h3>Choose a Layout</h3>
      <div className="slide-layouts-grid">
        {layouts.map((layout) => (
          <div 
            key={layout.id}
            className="slide-layout-item"
            onClick={() => onSelectLayout(layout.id)}
            title={layout.name}
          >
            {layout.thumbnail}
            <span className="layout-name">{layout.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideLayouts;
