/**
 * AppDelegate.swift — Manejo de deep links para OAuth nativo
 *
 * Este archivo ya existe en ios/App/App/AppDelegate.swift
 * Solo agregar el método `application(_:open:options:)` si no existe.
 *
 * El deep link lovia://auth/callback regresa el token del OAuth de vuelta
 * a Supabase para que complete el login dentro de la app.
 */

// AGREGAR DENTRO DE AppDelegate (ya existe el archivo)
// Buscar el método existente o agregar después de `application(_:didFinishLaunchingWithOptions:)`:

/*
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    // ── Deep Link handler para OAuth nativo ──────────────────────────────────
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
*/
