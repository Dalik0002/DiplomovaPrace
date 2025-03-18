package com.Multiplatform.myapplication_4

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform