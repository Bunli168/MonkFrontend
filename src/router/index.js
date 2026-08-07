import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { handleApiError } from '@/utils/apiError'

NProgress.configure({ showSpinner: false })

const routes = [
	{
		path: '/leave-request',
		name: 'leave-request',
		component: () => import('@/views/public/LeaveRequestView.vue'),
		meta: { public: true, title: 'Leave Request' }
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('@/views/auth/LoginView.vue'),
		meta: { title: 'Login' }
	},

	{
		path: '/forgot-password',
		name: 'forgot-password',
		component: () => import('@/views/auth/ForgotPasswordView.vue'),
		meta: { title: 'Forgot Password' }
	},
	{
		path: '/verify-email',
		name: 'verify-email',
		component: () => import('@/views/auth/VerifyEmailView.vue'),
		meta: { title: 'Verify Email' }
	},
	{
		path: '/reset-password',
		name: 'reset-password',
		component: () => import('@/views/auth/ChangePasswordView.vue'),
		meta: { title: 'Reset Password' }
	},
	{
		path: '/otp',
		name: 'otp',
		component: () => import('@/views/auth/OTPView.vue'),
		meta: { title: 'OTP' }
	},
	{
		path: '/change-password',
		name: 'change-password',
		component: () => import('@/views/auth/ChangePasswordView.vue'),
		meta: { title: 'Change Password' }
	},
	{
		path: '/',
		component: () => import('@/layouts/landingLayouts/LandingShell.vue'),
		children: [
			{
				path: '',
				name: 'Home',
				component: () => import('@/views/landing/HomeView.vue')
			},
			{
				path: 'about',
				name: 'About Us',
				component: () => import('@/views/landing/AboutUsView.vue')
			}
		]
	},
	{
		// Redirect old /tnak URL → /pagoda for backward compatibility
		path: '/tnak',
		redirect: '/pagoda'
	},
	{
		path: '/pagoda',
		component: () => import('@/layouts/tnakLayouts/TnakShell.vue'),
		meta: { requiresAuth: true, roles: ['MEKUDI', 'MONK', 'BHIKKHU', 'STUDENT', 'ATTENDANCETAKER'] },
		children: [
			{
				path: '',
				name: 'pagoda-overview',
				component: () => import('@/views/pagoda/PagodaOverviewView.vue')
			},
			{
				path: 'report',
				name: 'pagoda-reports',
				component: () => import('@/views/pagoda/PagodaReportView.vue')
			},

			{
				path: 'self-register',
				name: 'self-register',
				component: () => import('@/views/auth/SelfRegisterView.vue'),
				meta: { title: 'Self Register' }
			},
			{
				path: 'student-biography',
				name: 'pagoda-student-biography',
				component: () => import('@/views/pagoda/PagodaStudentBiographyView.vue'),
				meta: { roles: ['STUDENT'] }
			},
			{
				path: 'monk-biography',
				name: 'pagoda-monk-biography',
				component: () => import('@/views/pagoda/PagodaMonkBiographyView.vue'),
				meta: { roles: ['MONK', 'BHIKKHU', 'MEKUDI'] }
			},
			{
				path: 'student-profile-summary',
				name: 'pagoda-student-profile-summary',
				component: () => import('@/views/pagoda/PagodaStudentProfileSummaryView.vue'),
				meta: { roles: ['STUDENT'] }
			},

			{
				path: 'room',
				name: 'pagoda-rooms',
				component: () => import('@/views/pagoda/PagodaRoomView.vue')
			},
			{
				path: 'room/:id',
				name: 'pagoda-room-detail',
				component: () => import('@/views/pagoda/PagodaRoomDetailsView.vue')
			},
			{
				path: 'my-bookings',
				name: 'pagoda-my-bookings',
				component: () => import('@/views/pagoda/PagodaMyBookingsView.vue'),
				meta: { title: 'My Bookings' }
			},
			{
				path: 'my-events',
				name: 'pagoda-my-events',
				component: () => import('@/views/pagoda/PagodaMyEventsView.vue'),
				meta: { title: 'My Events', roles: ['MONK', 'BHIKKHU'] }
			},
			{
				path: 'leave-requests',
				name: 'pagoda-leave-requests',
				component: () => import('@/views/pagoda/PagodaLeaveRequestView.vue'),
				meta: { title: 'Leave Requests', roles: ['MONK', 'BHIKKHU'] }
			},
			{
				path: 'users',
				name: 'pagoda-users',
				component: () => import('@/views/admin/users/UserView.vue'),
				meta: { title: 'Users Management', roles: ['MEKUDI'] }
			},
			{
				path: 'attendance',
				name: 'pagoda-attendance',
				component: () => import('@/views/admin/attendance/AttendanceView.vue'),
				meta: { title: 'Attendance', roles: ['MEKUDI'] }
			},
			{
				path: 'taker/attendance',
				name: 'taker-attendance',
				component: () => import('@/views/taker/TakerTakeAttendanceView.vue'),
				meta: { title: 'Take Attendance', roles: ['ATTENDANCETAKER'] }
			},
			{
				path: 'scan-attendance',
				name: 'pagoda-self-scan',
				component: () => import('@/views/pagoda/PagodaSelfScanView.vue'),
				meta: { title: 'Scan Attendance', roles: ['MONK', 'STUDENT'] }
			},
			{
				path: 'taker/absences',
				name: 'taker-absent-permission',
				component: () => import('@/views/taker/TakerAbsentPermissionView.vue'),
				meta: { title: 'Absence & Permission', roles: ['ATTENDANCETAKER'] }
			},
			{
				path: 'taker/warnings',
				name: 'taker-warnings',
				component: () => import('@/views/taker/TakerWarningView.vue'),
				meta: { title: '3+ Absences Warning', roles: ['ATTENDANCETAKER'] }
			},
			{
				path: 'taker/management',
				name: 'taker-management',
				component: () => import('@/views/taker/TakerManagementView.vue'),
				meta: { title: 'Attendance Taker Management', roles: ['MEKUDI', 'ATTENDANCETAKER'] }
			},


			{
				path: 'ledger',
				name: 'pagoda-ledger',
				component: () => import('@/views/admin/attendance/LedgerView.vue'),
				meta: { title: 'Fine Ledger' }
			},
			{
				path: 'profile',
				name: 'pagoda-profile',
				component: () => import('@/views/pagoda/PagodaProfileView.vue')
			}
		]
	},
	{
		path: '/dashboard',
		component: () => import('@/layouts/dashboardLayouts/DashboardShell.vue'),
		meta: { requiresAuth: true, roles: ['SuperAdmin', 'ADMIN'] },
		children: [
			{
				path: '',
				name: 'dashboard',
				component: () => import('@/views/admin/OverviewView.vue'),
				meta: { title: 'Overview', roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] }
			},
			{
				path: 'user',
				name: 'dashboard-user',
				component: () => import('@/views/admin/users/UserView.vue'),
				meta: { title: 'Users Management', roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] }
			},
			{
				path: 'monk-biography',
				name: 'dashboard-monk-biography',
				component: () => import('@/views/pagoda/PagodaMonkBiographyView.vue'),
				meta: { title: 'My Biography', roles: ['MONK', 'BHIKKHU', 'MEKUDI', 'ADMIN', 'SuperAdmin'] }
			},
			{
				path: 'report',
				redirect: { name: 'system-settings' }
			},
			{
				path: 'system-settings',
				name: 'system-settings',
				component: () => import('@/views/admin/settings/SystemSettingsView.vue'),
				meta: { title: 'System Settings', roles: ['SuperAdmin'] }
			},
			{
				path: 'attendance',
				name: 'attendance',
				component: () => import('@/views/admin/attendance/AttendanceView.vue'),
				meta: { title: 'Attendance Management', roles: ['SuperAdmin', 'MEKUDI'] }
			},
			{
				path: 'taker/management',
				name: 'dashboard-taker-management',
				component: () => import('@/views/taker/TakerManagementView.vue'),
				meta: { title: 'Member Request Permission', roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] }
			},

			{
				path: 'kudi',
				redirect: '/dashboard/system-settings'
			},
			{
				path: 'room',
				name: 'room',
				component: () => import('@/views/admin/rooms/RoomView.vue'),
				meta: { title: 'Rooms Management', roles: ['SuperAdmin', 'ADMIN'] }
			},
			{
				path: 'fines',
				name: 'admin-fines-unpaid',
				component: () => import('@/views/admin/fines/AdminFineUnpaidView.vue'),
				meta: { title: 'Unpaid Fines', roles: ['SuperAdmin', 'ADMIN', 'ATTENDANCETAKER'] }
			},
			{
				path: 'fines/report',
				name: 'admin-fines-report',
				component: () => import('@/views/admin/fines/AdminFineReportView.vue'),
				meta: { title: 'Fine Payment Report', roles: ['SuperAdmin', 'ADMIN', 'ATTENDANCETAKER'] }
			},
			{
				path: 'ceremony-events',
				name: 'ceremony-events',
				component: () => import('@/views/admin/events/EventsTabView.vue'),
				meta: { title: 'Events & Assignments', roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] }
			},
			{
				path: 'leave-requests',
				name: 'dashboard-leave-requests',
				component: () => import('@/views/admin/attendance/AdminLeaveRequestsView.vue'),
				meta: { title: 'Leave Requests', roles: ['SuperAdmin', 'ADMIN', 'MEKUDI'] }
			},
			{
				path: 'settings',
				name: 'settings',
				component: () => import('@/views/admin/SettingsView.vue'),
				meta: { title: 'Profile Settings' }
			},
			{
				path: 'taker/attendance',
				name: 'dashboard-taker-attendance',
				component: () => import('@/views/taker/TakerTakeAttendanceView.vue'),
				meta: { title: 'Take Attendance', roles: ['SuperAdmin', 'ADMIN'] }
			},
			{
				path: 'taker/absences',
				name: 'dashboard-taker-absent-permission',
				component: () => import('@/views/taker/TakerAbsentPermissionView.vue'),
				meta: { title: 'Absence & Permission', roles: ['SuperAdmin', 'ADMIN'] }
			},
			{
				path: 'taker/warnings',
				name: 'dashboard-taker-warnings',
				component: () => import('@/views/taker/TakerWarningView.vue'),
				meta: { title: '3+ Absences Warning', roles: ['SuperAdmin', 'ADMIN'] }
			}
			// ✅ Removed duplicate 'dashboard-taker-management' route (was defined twice,
			//    causing undefined Vue Router behavior). The canonical definition is above at line ~241.
		]
	},
	{
		path: '/403',
		name: 'Forbidden',
		component: () => import('@/views/errors/ForbiddenView.vue'),
		meta: { title: '403 - Forbidden' }
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/errors/NotFoundView.vue'),
		meta: { title: '404 - Page Not Found' }
	}
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	linkExactActiveClass: 'active'
});

router.beforeEach(async (to, from) => {
	// Don't show loading bar when switching between tabs in the Pagoda dashboard
	if (!(to.path.startsWith('/pagoda') && from.path.startsWith('/pagoda'))) {
		NProgress.start()
	}
	const authStore = useAuthStore()

	if (authStore.accessToken && !authStore.user) {
		try {
			await authStore.fetchProfile()
		} catch (e) {
			authStore.clearAuth()
			return { name: 'login' }
		}
	}

	const isAuthenticated = authStore.isAuthenticated
	// ✅ Use sessionStorage (tab-scoped) for auth flow tokens — consistent with auth.js
	const needsPasswordChange = !!sessionStorage.getItem('changePasswordToken');
	const needOtpVerify = !!sessionStorage.getItem('otpSessionToken');
	const authPages = ['login', 'otp', 'change-password', 'forgot-password', 'reset-password']

	if ((!needOtpVerify && to.name == 'otp') || (!needsPasswordChange && to.name == 'change-password')) {
		return { name: 'login' }
	}

	if (needsPasswordChange) {
		if (to.name === 'change-password') return true
		if (to.name === '' || to.name === 'login') return true
		return { name: 'change-password' }
	}

	if (to.name == 'reset-password' && !to.query.token) {
		return { name: 'login' }
	}

	if (authPages.includes(to.name)) {
		if (isAuthenticated) {
			if (authStore.isSuperAdmin) return { name: 'dashboard' }
			if (authStore.isAdmin) return { name: 'dashboard' }
			return { name: 'pagoda-overview' }
		}
		return true
	}

	if (!to.meta.requiresAuth) {
		return true
	}

	// 5. Protected routes — must be authenticated
	if (!isAuthenticated) {
		return { name: 'login', query: { redirect: to.fullPath } }
	}

	// 6. Role-based access control
	const requiredRoles = to.meta.roles

	if (requiredRoles && !authStore.hasRole(requiredRoles)) {
		const target = authStore.isSuperAdmin || authStore.isAdmin ? 'dashboard' : 'pagoda-overview'
		if (to.name !== target) {
			return { name: target }
		}
	}

	return true
})

router.afterEach((to) => {
	NProgress.done()
	const suffix = to.path.startsWith('/dashboard') ? 'Admin Dashboard' : 'Pagoda Management'
	document.title = to.meta.title ? `${to.meta.title} | ${suffix}` : suffix
})

router.onError(() => {
	NProgress.done()
})

export default router
