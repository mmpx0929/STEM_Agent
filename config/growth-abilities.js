const growthAbilities = [
  {
    key: 'scientificThinking',
    name: '\u79d1\u5b66\u601d\u7ef4\u80fd\u529b',
    description: '\u56f4\u7ed5\u79d1\u5b66\u95ee\u9898\u8fdb\u884c\u63a8\u7406\u5e76\u5b8c\u6210\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1\u3002',
    color: '#2f7cf6',
    children: [
      { key: 'reasoning', name: '\u79d1\u5b66\u63a8\u7406\u80fd\u529b' },
      { key: 'design', name: '\u79d1\u5b66\u8bbe\u8ba1\u80fd\u529b' }
    ]
  },
  {
    key: 'scientificInquiry',
    name: '\u79d1\u5b66\u63a2\u7a76\u80fd\u529b',
    description: '\u5728\u63a2\u7a76\u4e2d\u5b8c\u6210\u52a8\u624b\u9a8c\u8bc1\u3001\u6570\u636e\u5206\u6790\u548c\u7ed3\u8bba\u8868\u8fbe\u3002',
    color: '#17a673',
    children: [
      { key: 'handsOn', name: '\u52a8\u624b\u5b9e\u8df5\u80fd\u529b' },
      { key: 'dataAnalysis', name: '\u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790\u80fd\u529b' },
      { key: 'reportMaking', name: '\u7ed3\u8bba\u62a5\u544a\u4e0e\u5236\u4f5c\u80fd\u529b' }
    ]
  },
  {
    key: 'engineeringThinking',
    name: '\u5de5\u7a0b\u601d\u7ef4\u80fd\u529b',
    description: '\u4ece\u76ee\u6807\u3001\u7ea6\u675f\u548c\u65b9\u6848\u6743\u8861\u89d2\u5ea6\u505a\u5de5\u7a0b\u51b3\u7b56\u3002',
    color: '#f58b1f',
    children: [
      { key: 'engineeringDesign', name: '\u5de5\u7a0b\u6a21\u578b\u65b9\u6848\u8bbe\u8ba1\u80fd\u529b' }
    ]
  },
  {
    key: 'engineeringInquiry',
    name: '\u5de5\u7a0b\u63a2\u7a76\u80fd\u529b',
    description: '\u901a\u8fc7\u642d\u5efa\u3001\u6d4b\u8bd5\u3001\u4f18\u5316\u548c\u590d\u76d8\uff0c\u5b8c\u6210\u5de5\u7a0b\u8fed\u4ee3\u3002',
    color: '#7e57c2',
    children: [
      { key: 'modelBuilding', name: '\u6a21\u578b\u642d\u5efa\u80fd\u529b' },
      { key: 'modelTesting', name: '\u6a21\u578b\u6d4b\u8bd5\u4e0e\u6570\u636e\u5206\u6790\u80fd\u529b' },
      { key: 'optimization', name: '\u8fed\u4ee3\u4f18\u5316\u80fd\u529b' },
      { key: 'engineeringReport', name: '\u5de5\u7a0b\u62a5\u544a\u5236\u4f5c\u80fd\u529b' }
    ]
  }
];

export default growthAbilities;

