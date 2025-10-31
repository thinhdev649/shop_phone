import './style.css'
import { router } from './utils/router'
import { renderHomePage } from './pages/home'
import { renderBrandPage } from './pages/brand'
import { renderBrandsPage } from './pages/brands'
import { renderPhonesPage } from './pages/phones'
import { renderPhoneDetailPage } from './pages/phoneDetail'
import { renderCartPage } from './pages/cart'

// Define routes
router.addRoute('/', () => {
  renderHomePage()
})

router.addRoute('/brands', () => {
  renderBrandsPage()
})

router.addRoute('/brand/:brandId', ({ brandId }) => {
  renderBrandPage(brandId)
})

router.addRoute('/phones', () => {
  renderPhonesPage()
})

router.addRoute('/phone/:phoneId', ({ phoneId }) => {
  renderPhoneDetailPage(phoneId)
})

router.addRoute('/cart', () => {
  renderCartPage()
})

// Start the router
router.start()
