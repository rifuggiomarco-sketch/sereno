# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep main activity
-keep class com.sereno.app.MainActivity { *; }

# Keep your app package classes
-keep class com.sereno.app.** { *; }