import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Home() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("telegram_session")

  if (sessionToken) {
    redirect("/dashboard")
  } else {
    redirect("/auth")
  }
}
