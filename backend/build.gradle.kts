import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.gradle.jvm.tasks.Jar

plugins {
    kotlin("jvm") version "2.3.20"
    kotlin("plugin.spring") version "2.3.20"
    id("org.springframework.boot") version "3.5.13"
    id("io.spring.dependency-management") version "1.1.7"
    `maven-publish`
}

group = "com.pizzalab"
version = providers.gradleProperty("releaseVersion")
    .orElse(
        providers.environmentVariable("GITHUB_REF").map { ref ->
            if (ref.startsWith("refs/tags/v")) {
                ref.removePrefix("refs/tags/v")
            } else {
                "0.1.0-SNAPSHOT"
            }
        },
    )
    .orElse("0.1.0-SNAPSHOT")
    .get()

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")
        jvmTarget.set(JvmTarget.JVM_21)
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}

tasks.register<Jar>("sourcesJar") {
    archiveClassifier.set("sources")
    from(sourceSets.main.get().allSource)
}

tasks.withType<Test> {
    useJUnitPlatform()
}

publishing {
    publications {
        create<MavenPublication>("backend") {
            from(components["java"])
            artifact(tasks.named("sourcesJar"))

            pom {
                name.set("PizzaLab Backend")
                description.set("Backend API for calculating Neapolitan pizza dough formulas.")
                url.set("https://github.com/alexpoty/PizzaLab")

                licenses {
                    license {
                        name.set("UNLICENSED")
                    }
                }

                developers {
                    developer {
                        id.set("alexpoty")
                    }
                }

                scm {
                    connection.set("scm:git:https://github.com/alexpoty/PizzaLab.git")
                    developerConnection.set("scm:git:https://github.com/alexpoty/PizzaLab.git")
                    url.set("https://github.com/alexpoty/PizzaLab")
                }
            }
        }
    }

    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/${providers.environmentVariable("GITHUB_REPOSITORY").orElse("alexpoty/PizzaLab").get()}")

            credentials {
                username = providers.environmentVariable("GITHUB_ACTOR")
                    .orElse(providers.gradleProperty("gpr.user"))
                    .orNull
                password = providers.environmentVariable("GITHUB_TOKEN")
                    .orElse(providers.gradleProperty("gpr.key"))
                    .orNull
            }
        }
    }
}
