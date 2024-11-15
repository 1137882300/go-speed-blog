'use client'

import {useState, useEffect, useCallback} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {Loader2} from "lucide-react"
import Image from 'next/image'

const domains = [
  'https://blog.923828.xyz',
  'https://blog.robus.us.kg',
  'https://tc.blog.923828.xyz',
  'https://cf.blog.923828.xyz',
  'https://1137882300.github.io',
  'https://zeaburblog.923828.xyz',
  'https://astro.blog.923828.xyz',
  'https://vercel.blog.923828.xyz',
  'https://astro-cf.blog.923828.xyz',
  'https://blog.crab888.cloudns.org',
  'https://blog.crab6688.cloudns.org',
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
  const [visitorCount, setVisitorCount] = useState(673)
  // 新增：记录用户选择的域名
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  // 将 testSpeed 移到 useCallback 中
  const testSpeed = useCallback(async (domain: string): Promise<number> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const start = performance.now();
      await fetch(domain, {
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store'
      });
      const end = performance.now();
      clearTimeout(timeoutId);
      return end - start;
    } catch (error) {
      console.error(`Error testing ${domain}:`, error);
      return Infinity;
    }
  }, [])

  const runSpeedTests = useCallback(async () => {
    const results: { [key: string]: number } = {};
    
    const tests = domains.map(async (domain) => {
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
    
    const validResults = Object.entries(results).filter(([, speed]) => speed !== Infinity);
    if (validResults.length > 0) {
      const fastest = validResults.reduce((a, b) => a[1] < b[1] ? a : b)[0];
      setFastestDomain(fastest);
    }
    
    setTesting(false);
  }, [testSpeed])

  // 新增：处理域名跳转的函数
  const handleDomainClick = (domain: string) => {
    setSelectedDomain(domain)
    window.open(domain, '_blank')
  }

  useEffect(() => {
    runSpeedTests()
    setVisitorCount(prev => prev + 1) // Increment visitor count
  }, [runSpeedTests])

  useEffect(() => {
    if (fastestDomain && autoRedirect) {
      window.location.href = fastestDomain
    }
  }, [fastestDomain, autoRedirect])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <Image
              src="/favicon-256.ico"
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-xl font-bold">BlogCDN 智能访问网关</CardTitle>
          <CardDescription className="text-sm">测速并选择最快的域名</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          {testing ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin"/>
              <p className="text-sm">测速中...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-center text-sm">测速结果 (毫秒):</h3>
              <ul className="space-y-1">
                {Object.entries(speeds).map(([domain, speed]) => (
                  <li 
                    key={domain} 
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-1 rounded text-sm"
                    onClick={() => handleDomainClick(domain)}
                  >
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
                <Label htmlFor="auto-redirect" className="text-sm">自动跳转</Label>
              </div>
              {autoRedirect && (
                <p className="text-center text-sm text-gray-500">
                  即将跳转到最快的域名: {fastestDomain.split('//')[1]}
                </p>
              )}
              {selectedDomain && (
                <p className="text-center text-xs text-gray-500">
                  已选择域名: {selectedDomain.split('//')[1]}
                </p>
              )}
            </div>
          )}
          <p className="text-center mt-2 text-xs text-gray-500">
            今日访问人数: {visitorCount}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
