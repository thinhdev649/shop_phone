import './style.css'
import { router } from './utils/router'
import { renderHomePage } from './pages/home'
import { renderPhonesPage } from './pages/phones'
import { renderPhoneDetailPage } from './pages/phoneDetail'
import { renderCartPage } from './pages/cart'
import { renderCheckoutPage } from './pages/checkout'
import { renderBrandPage } from './pages/brand'
import { renderCategoriesPage } from './pages/categories'
import { renderLoginPage } from './pages/login'
import { renderRegisterPage } from './pages/register'

// Define routes
router.addRoute('/', () => {
  renderHomePage()
})

router.addRoute('/categories', () => {
  renderCategoriesPage()
})

router.addRoute('/phones', () => {
  renderPhonesPage()
})

router.addRoute('/phone/:phoneId', ({ phoneId }) => {
  renderPhoneDetailPage(phoneId)
})

router.addRoute('/brand/:brandId', ({ brandId }) => {
  renderBrandPage(brandId)
})

router.addRoute('/cart', () => {
  renderCartPage()
})

router.addRoute('/checkout', () => {
  renderCheckoutPage()
})

router.addRoute('/login', () => {
  renderLoginPage()
})

router.addRoute('/register', () => {
  renderRegisterPage()
})


// Start the router
router.start()
