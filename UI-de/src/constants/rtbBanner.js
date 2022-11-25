export default {
  '2.5': {
    request: {
      'id': 'c6987c2b-edb4-4b7b-b8cf-157af1d485e3',
      'site': {
        'id': 'gumgum_www.answers.com_ed2265d8',
        'ref': 'http://ad32.answers.com/click.php?source=fb&param4=fb-us-de-red',
        'publisher': {
          'name': 'www.answers.com',
          'id': 'gumgum_946353442_12535',
        },
        'name': 'www.answers.com',
        'cat': [
          'IAB19-11',
        ],
        'domain': 'answers.com',
        'ext': {},
        'page': 'http://www.answers.com/article/31029589/insanely-useful-life-hacks-to-make-everything-easier',
      },
      'wseat': [
        '165',
        '16',
      ],
      'source': {
        'fd': 0,
      },
      'user': {
        'id': '5e29eb00-c30a-416e-9d2a-2e18901f0916',
        'ext': {
          'cookie_age': 64,
          'consent': 'Y29uc2VudCBkYXRh',
        },
        'buyeruid': 'CAESEHL-9O4oJOAiC1Y0O2EHTcE',
      },
      'device': {
        'pxratio': 0,
        'language': 'en',
        'mccmnc': '310-005',
        'w': 1920,
        'geo': {
          'country': 'USA',
          'lon': -80.237,
          'city': 'West Palm Beach',
          'lat': 26.638,
          'zip': '33414',
          'region': 'FL',
          'type': 2,
        },
        'os': 'Android',
        'devicetype': 4,
        'h': 1080,
        'ip': '73.139.39.18',
        'js': 1,
        'ua': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
        'dnt': 0,
      },
      'tmax': 75,
      'cur': [
        'USD',
      ],
      'imp': [
        {
          'bidfloor': 0.213,
          'metric': [
            {
              'type': 'viewability',
              'value': 0.85,
            },
          ],
          'id': 'sdf-erer2-2341',
          'banner': {
            'pos': 1,
            'h': 600,
            'battr': [1, 3, 5, 6, 8, 9, 10, 14, 15, 16],
            'w': 160,
            'format': [
              {
                'h': 300,
                'w': 300,
              },
              {
                'h': 350,
                'w': 300,
              },
            ],
            'btype': [
              1,
            ],
          },
          'exp': 300,
          'tagid': 'gumgum_25108',
          'bidfloorcur': 'USD',
          'ext': {},
          'secure': 0,
          'instl': 0,
        },
      ],
      'bcat': [
        'IAB25-3',
        'BSW1',
        'BSW2',
        'BSW10',
        'BSW4',
        'IAB26',
      ],
      'regs': {
        'ext': {
          'gdpr': 1,
        },
      },
      'ext': {
        'wt': 1,
        'clktrkrq': 0,
        'is_secure': 0,
        'ssp': 'gumgum',
      },
      'at': 2,
    },
    response: {
      'id': '38d68c12-2cd3-4d4c-b210-5865c57c24e8',
      'ext': {
        'protocol': 5.3,
      },
      'seatbid': [
        {
          'bid': [
            {
              'id': 'c77f1c7d-dcc3-40c3-a2e0-9514a4971d03',
              'impid': 'sdf-erer2-2341',
              'price': 2,
              'cid': 14,
              'cat': [
                'IAB1-4',
              ],
              'language': 'en',
              'burl': 'http://tracker.com/imp?proxy=true&bid=38d68c12-2cd3-4d4c-b210-5865c57c24e8&pid=1',
              'adm': '<a href="tracker.com/click?mp=CPM&fid=1&bid=38d68c12-2cd3-4d4c-b210-5865c57c24e8&pid=1"><img src="http://banner.com"/></a>',
              'nurl': 'http://tracker.com/winnotice?bid=38d68c12-2cd3-4d4c-b210-5865c57c24e8&winprice=${AUCTION_PRICE}',
            },
          ],
        },
      ],
    },
  },
  '2.3': {
    request: {
      'id': '80ce30c53c16e6ede735f123ef6e32361bfc7b22',
      'at': 1, 'cur': ['USD'],
      'imp': [
        {
          'id': '1', 'bidfloor': 0.03,
          'banner': {
            'h': 250, 'w': 300, 'pos': 0,
          },
        },
      ],
      'site': {
        'id': '102855',
        'cat': ['IAB3-1'],
        'domain': 'www.foobar.com',
        'page': 'http://www.foobar.com/1234.html ',
        'publisher': {
          'id': '8953', 'name': 'foobar.com',
          'cat': ['IAB3-1'],
          'domain': 'foobar.com',
        },
      },
      'device': {
        'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)...',
      },
      'user': {
        'id': '55816b39711f9b5acf3b90e313ed29e51665623f',
      },
    },
    response: {
      'id': '1234567890', 'bidid': 'abc1123', 'cur': 'USD',
      'seatbid': [
        {
          'seat': '512',
          'bid': [
            {
              'id': '1', 'impid': '102', 'price': 9.43,
              'nurl': 'http://adserver.com/winnotice?impid=102',
              'iurl': 'http://adserver.com/pathtosampleimage',
              'adomain': ['advertiserdomain.com'],
              'cid': 'campaign111',
              'crid': 'creative112',
              'attr': [1, 7, 12],
            },
          ],
        },
      ],
    },
  },
};
