/* Components */
import HomePage from '../components/HomePage/HomePage'
import FindByCountry from '../components/FindByCountry/FindByCountry'
import PlaceDetails from '../components/PlaceDetails/PlaceDetails'
import BlogDetails from '../components/BlogDetails/BlogDetails'
import CountryPlacesList from '../components/CountryPlacesList/CountryPlacesList'
import Login from '../components/Login/Login'
import UserRegistration from '../components/UserRegistration/UserRegistration'
import CheckInList from '../components/CheckInList/CheckInList'
import StaticPage from '../components/StaticPage/StaticPage'
import CheckIn from '../components/CheckIn/CheckIn'
import CreateNewPlace from '../components/CreateNewPlace/CreateNewPlace'
import ResetPassword from '../components/ResetPassword/ResetPassword'
import EditAccount from '../components/EditAccount/EditAccount'

/* Actions */
import { placesByCountryAction } from '../actions/placesByCountry'
import { placeDetailsAction } from '../actions/placeDetailsAction'
import { blogDetailsAction, blogDetailsFromEditAction } from '../actions/blogDetailsAction'
import { blogCheckInsAction } from '../actions/blogCheckInsAction'
import { searchForPlacesAction } from '../actions/searchForPlacesAction'
import { getStaticContentAction } from '../actions/getStaticContentAction'
import { checkResetTokenAction } from '../actions/checkResetToken'
import { getPlaceTypesFromAPI } from '../actions/getPlaceTypes'

/* Routes */
const routes = [
  {
    path: '/countries/places_by_country',
    title: 'Find Places by Country - iOverlander',
    component: FindByCountry,
    action: placesByCountryAction
  },
  {
    path: '/users/sign_in',
    title: 'iOverlander - Login',
    component: Login
  },
 {
    path: '/users/reset_password',
    title: 'iOverlander - Reset your password',
    component: ResetPassword,
    action: checkResetTokenAction
  },
  {
    path: '/users/sign_up',
    title: 'iOverlander - Register',
    component: UserRegistration
  },
  {
    path: '/users/edit',
    title: 'iOverlander - Edit Account',
    component: EditAccount,
    role_required: 'user',
    action: blogDetailsFromEditAction
  },
  {
    path: '/places/new',
    component: CreateNewPlace,
    title: 'Add new Place | iOverlander',
    role_required: 'user',
    action: placeDetailsAction
  },
  {
    path: '/places/:id',
    component: PlaceDetails,
    action: placeDetailsAction
  },
  {
    path: '/blogs/:id',
    component: BlogDetails,
    action: blogDetailsAction
  },
  {
    path: '/blogs/:id/check_ins/:page',
    component: CheckInList,
    action: blogCheckInsAction
  },
  {
    path: '/country_places_list/:country/:page',
    component: CountryPlacesList,
    action: searchForPlacesAction
  },
  {
    path: '/static/:pageName',
    component: StaticPage,
    action: getStaticContentAction
  },
  {
    path: '/places/:id/check_in',
    component: CheckIn,
    action: placeDetailsAction,
    title: 'Check-in | iOverlander',
    role_required: 'user'
  },
  {
    path: '/',
    title: 'iOverlander - Find your next destination',
    component: HomePage,
    action: getPlaceTypesFromAPI
  }
]

export default routes
