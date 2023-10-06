import type { ReactNode } from "react"
import { createContext, useContext } from "react"

type FeatureFlags = {
  premium: boolean
  maps: boolean
}

const FeatureFlagContext = createContext<FeatureFlags>(null!)

export function FeatureFlagProvider({
  defaultValue,
  children,
}: {
  defaultValue: FeatureFlags
  children: ReactNode
}) {
  return <FeatureFlagContext.Provider value={defaultValue}>{children}</FeatureFlagContext.Provider>
}

export const useFeatureFlags = () => useContext(FeatureFlagContext)
