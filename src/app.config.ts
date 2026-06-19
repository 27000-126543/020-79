export default defineAppConfig({
  pages: [
    'pages/event/index',
    'pages/quickread/index',
    'pages/risk/index',
    'pages/mine/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E56A0',
    navigationBarTitleText: '舆情快览',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E56A0',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/event/index',
        text: '事件关注'
      },
      {
        pagePath: 'pages/quickread/index',
        text: '媒体快读'
      },
      {
        pagePath: 'pages/risk/index',
        text: '风险提醒'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
