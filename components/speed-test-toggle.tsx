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

// 添加速度等级的类型
type SpeedLevel = 'fast' | 'medium' | 'slow' | 'timeout';

// 添加速度评估函数
const getSpeedLevel = (speed: number): SpeedLevel => {
  if (speed === Infinity) return 'timeout';
  if (speed < 500) return 'fast';
  if (speed < 1000) return 'medium';
  return 'slow';
}

// 获取对应的颜色类名
const getSpeedColorClass = (speed: number): string => {
  const level = getSpeedLevel(speed);
  switch (level) {
    case 'fast':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'slow':
      return 'text-red-500';
    case 'timeout':
      return 'text-gray-500';
  }
}

export function SpeedTestToggleComponent() {
  const [speeds, setSpeeds] = useState<{ [key: string]: number }>({})
  const [testing, setTesting] = useState(true)
  const [fastestDomain, setFastestDomain] = useState('')
  const [autoRedirect, setAutoRedirect] = useState(false)
  const [visitorCount, setVisitorCount] = useState(673) // Starting with the count from the image

  const testSpeed = async (domain: string): Promise<number> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const start = performance.now();
      await fetch(domain, {
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store' // 禁用缓存
      });
      const end = performance.now();
      clearTimeout(timeoutId);
      return end - start;
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
      return Infinity;
    }
  }

  // 修改 runSpeedTests 函数
  const runSpeedTests = async () => {
    const results: { [key: string]: number } = {};
    
    // 并行执行所有测速
    const tests = domains.map(async (domain) => {
      // 进行多次测试取平均值
      const attempts = 2;
      let totalTime = 0;
      
      for (let i = 0; i < attempts; i++) {
        const time = await testSpeed(domain);
        totalTime += time;
      }
      
      results[domain] = totalTime / attempts;
    });
    
    await Promise.all(tests);
    setSpeeds(results);
    
    const validResults = Object.entries(results).filter(([_, speed]) => speed !== Infinity);
    if (validResults.length > 0) {
      const fastest = validResults.reduce((a, b) => a[1] < b[1] ? a : b)[0];
      setFastestDomain(fastest);
    }
    
    setTesting(false);
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
              src="/favicon-256.ico"
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
                  <li key={domain} className="flex justify-between items-center">
                    <span>{domain.split('//')[1]}</span>
                    <span className={`font-medium ${getSpeedColorClass(speed)}`}>
                      {speed === Infinity ? '超时' : `${speed.toFixed(0)}ms`}
                    </span>
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
