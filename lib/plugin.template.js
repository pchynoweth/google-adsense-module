import Vue from 'vue'

// Custom AdSense Ad Component
let adsbygoogle = {
  render (h) {
    return h(
      'ins',
      {
        'class': ['adsbygoogle'],
        style: this.adStyle,
        attrs: {
          'data-ad-client': this.adClient,
          'data-ad-slot': this.adSlot || null,
          'data-ad-format': this.adFormat,
          'data-ad-region': this.showAdRegion && this.show ? this.adRegion() : null,
          'data-ad-layout': this.adLayout || null,
          'data-ad-layout-key': this.adLayoutKey || null,
          'data-page-url': this.pageUrl ? this.pageUrl : null,
          'data-analytics-uacct': this.analyticsUacct ? this.analyticsUacct : null,
          'data-analytics-domain-name': this.analyticsDomainName ? this.analyticsDomainName : null,
          'data-adtest': <%= options.test ? '\'on\'' : 'null' %>,
          'data-adsbygoogle-status': this.show ? null : '',
          'data-full-width-responsive': this.fullWidthResponsive || null,
        },
        domProps: {
          innerHTML: this.show ? '' : ' '
        },
        key: Math.random()
      }
    )
  },
  props: {
    adClient: {
      type: String,
      default: '<%= options.id %>'
    },
    adSlot: {
      type: String
    },
    adFormat: {
      type: String,
      default: 'auto'
    },
    adLayout: {
      type: String
    },
    adLayoutKey: {
      type: String
    },
    adStyle: {
      type: Object,
      default () {
        return {
          display: 'block'
        }
      }
    },
    showAdRegion: {
      type: Boolean,
      default: <%= options.showAdRegion %>
    },
    pageUrl: {
      type: String
    },
    analyticsUacct: {
      type: String,
      default: '<%= options.analyticsUacct %>'
    },
    analyticsDomainName: {
      type: String,
      default: '<%= options.analyticsDomainName %>'
    },
    includeQuery: {
      type: Boolean,
      default: <%= options.includeQuery %>
    },
    fullWidthResponsive: {
      type: String
    },
    requestNonPersonalizedAds: {
      type: Boolean,
      default: <%= options.requestNonPersonalizedAds %>
    },
    pauseAdRequests: {
      type: Boolean,
      default: <%= options.pauseAdRequests %>
    }
  },
  data () {
    return {
      show: true
    }
  },
  mounted () {
    this.showAd()
  },
  watch: {
    '$route' (to, from) {
      if (to.fullPath === from.fullPath) {
        return;
      }
      const keys = Object.keys
      const toQuery = to.query
      const fromQuery = from.query
      let changed = false
      if (to.path !== from.path) {
        changed = true
      } else if (this.includeQuery) {
        // If we include query params, check to see if they are loosely unequal
        changed = (keys(toQuery).length !== keys(fromQuery).length) || !keys(toQuery).every(k => toQuery[k] === fromQuery[k])
      }
      if (changed) {
        // If the route has changed, update the ad
        this.updateAd()
      }
    },
    pauseAdRequests (to, from) {
      if (to) {
        return
      }

      window.adsbygoogle = window.adsbygoogle || []

      if (this.requestNonPersonalizedAds) {
        window.adsbygoogle.requestNonPersonalizedAds = 1
      }

      window.adsbygoogle.pauseAdRequests = 0
    }
  },
  methods: {
    adRegion () {
      return 'page-' + Math.random()
    },
    updateAd () {
      if (this.isServer) {
        return
      }
      // Reset the INS element
      this.show = false
      // Show new ad on nextTick
      this.$nextTick(this.showAd)
    },
    showAd () {
      this.show = true
      this.$nextTick(() => {
        try {
          window.adsbygoogle = window.adsbygoogle || []

          if (this.pauseAdRequests) {
            window.adsbygoogle.pauseAdRequests = 1
          }

          if (this.requestNonPersonalizedAds) {
            window.adsbygoogle.requestNonPersonalizedAds = 1
          }

          // Once ad container (<ins>) DOM has (re-)rendered, requesst a new advert
          window.adsbygoogle.push({})
        } catch (error) {
          console.error(error)
        }
      })
    }
  }
}

// Register our ad component under the desired tag name
Vue.component('<%= options.tag %>', adsbygoogle)

// Expose methods for driving paused auto / page level ads
export default (ctx, inject) => {
  inject('<%= options.alias %>', {
    requestNonPersonalizedAds(val) {
      (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = val
    },
    unpauseAdRequests() {
      (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0
    },
  })
}
