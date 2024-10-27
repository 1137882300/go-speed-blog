'use client'

import {useState, useEffect} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {Loader2} from "lucide-react"
import Image from 'next/image'

const domains = [
  'https://blog.923828.xyz/',
  'https://cf.blog.923828.xyz/',
  'https://vercel.blog.923828.xyz/',
  'https://zeaburblog.923828.xyz/',
  'https://1137882300.github.io/',
  'https://blog.crab6688.cloudns.org/'
]

export function SpeedTestToggleComponent() {
  const [speeds, setSpeeds] = useState<{ [key: string]: number }>({})
  const [testing, setTesting] = useState(true)
  const [fastestDomain, setFastestDomain] = useState('')
  const [autoRedirect, setAutoRedirect] = useState(true)
  const [visitorCount, setVisitorCount] = useState(673) // Starting with the count from the image

  const testSpeed = async (domain: string) => {
    const start = performance.now()
    try {
      await fetch(domain, {mode: 'no-cors'})
      const end = performance.now()
      return end - start
    } catch (error) {
      console.error(`Error testing ${domain}:`, error)
      return Infinity
    }
  }

  const runSpeedTests = async () => {
    const results: { [key: string]: number } = {}
    for (const domain of domains) {
      results[domain] = await testSpeed(domain)
    }
    setSpeeds(results)
    const fastest = Object.entries(results).reduce((a, b) => a[1] < b[1] ? a : b)[0]
    setFastestDomain(fastest)
    setTesting(false)
  }

  useEffect(() => {
    runSpeedTests()
    setVisitorCount(prev => prev + 1) // Increment visitor count
  }, [])

  useEffect(() => {
    if (fastestDomain && autoRedirect) {
      window.location.href = fastestDomain
    }
  }, [fastestDomain, autoRedirect])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/favicon.png"
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold">BlogCDN 智能访问网关</CardTitle>
          <CardDescription>测试域名速度并选择最快的域名</CardDescription>
        </CardHeader>
        <CardContent>
          {testing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin"/>
              <p>测速中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">测速结果 (毫秒):</h3>
              <ul className="space-y-2">
                {Object.entries(speeds).map(([domain, speed]) => (
                  <li key={domain} className="flex justify-between">
                    <span>{domain.split('//')[1]}</span>
                    <span>{speed.toFixed(2)}ms</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-2 justify-center">
                <Switch
                  id="auto-redirect"
                  checked={autoRedirect}
                  onCheckedChange={setAutoRedirect}
                />
                <Label htmlFor="auto-redirect">自动跳转</Label>
              </div>
              {autoRedirect && (
                <p className="text-center mt-4">
                  即将跳转到最快的域名: {fastestDomain.split('//')[1]}
                </p>
              )}
            </div>
          )}
          <p className="text-center mt-4 text-sm text-gray-500">
            今日访问人数: {visitorCount}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
