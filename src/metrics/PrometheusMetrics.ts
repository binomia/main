import { Counter, Gauge, Registry } from "prom-client";

export default class PrometheusMetrics {
    user: Counter
    users: Counter
    sessionUser: Counter
    searchUsers: Counter
    searchSingleUser: Counter
    userByEmail: Counter
    sugestedUsers: Counter
    createUser: Counter
    updateUser: Counter
    updateUserPassword: Counter
    login: Counter
    verifySession: Counter
    moneyFlow: Gauge


    constructor() {
        this.user = new Counter({
            name: `main_server_user_graphql_total_calls`,
            help: `Number of times the user resolver is called`,
        })

        this.users = new Counter({
            name: `main_server_users_graphql_total_calls`,
            help: `Number of times the users resolver is called`,
        })

        this.sessionUser = new Counter({
            name: `main_server_session_user_graphql_total_calls`,
            help: `Number of times the session_user resolver is called`,
        })

        this.searchUsers = new Counter({
            name: `main_server_search_users_graphql_total_calls`,
            help: `Number of times the search_users resolver is called`,
        })

        this.searchSingleUser = new Counter({
            name: `main_server_search_single_user_graphql_total_calls`,
            help: `Number of times the search_single_user resolver is called`,
        })

        this.userByEmail = new Counter({
            name: `main_server_user_by_email_graphql_total_calls`,
            help: `Number of times the user_by_email resolver is called`,
        })

        this.sugestedUsers = new Counter({
            name: `main_server_sugested_users_graphql_total_calls`,
            help: `Number of times the sugested_users resolver is called`,
        })

        this.createUser = new Counter({
            name: `main_server_create_user_graphql_total_calls`,
            help: `Number of times the create_user resolver is called`,
        })

        this.updateUser = new Counter({
            name: `main_server_update_user_graphql_total_calls`,
            help: `Number of times the update_user resolver is called`,
        })

        this.updateUserPassword = new Counter({
            name: `main_server_update_user_password_graphql_total_calls`,
            help: `Number of times the update_user_password resolver is called`,
        })

        this.login = new Counter({
            name: `main_server_login_graphql_total_calls`,
            help: `Number of times the login resolver is called`,
        })

        this.verifySession = new Counter({
            name: `main_server_verify_session_graphql_total_calls`,
            help: `Number of times the verify_session resolver is called`,
        })

        this.moneyFlow = new Gauge({
            name: `main_server_total_money_flow`,
            help: `Number of times the money_flow resolver is called`,
        })

        this.registerMetrics()
    }


    registerMetrics() {
        const register = new Registry();
        register.registerMetric(this.user);
        register.registerMetric(this.users);
        register.registerMetric(this.sessionUser);
        register.registerMetric(this.searchUsers);
        register.registerMetric(this.searchSingleUser);
        register.registerMetric(this.userByEmail);
        register.registerMetric(this.sugestedUsers);
        register.registerMetric(this.createUser);
        register.registerMetric(this.updateUser);
        register.registerMetric(this.updateUserPassword);
        register.registerMetric(this.login);
        register.registerMetric(this.verifySession);
        register.registerMetric(this.moneyFlow);

        return register
    }
}