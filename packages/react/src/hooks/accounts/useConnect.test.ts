import { MockConnector, defaultChains, wallets } from 'wagmi-testing'

import { actHook, renderHook } from '../../../test'
import { useConnect } from './useConnect'

describe('useConnect', () => {
  describe('on mount', () => {
    it('is not connected', async () => {
      const { result } = renderHook(() => useConnect())
      const { data: { connectors, ...restData } = {}, ...rest } =
        result.current[0]
      expect(connectors?.length).toEqual(1)
      expect({ data: restData, ...rest }).toMatchInlineSnapshot(`
        {
          "data": {
            "connected": false,
            "connector": undefined,
          },
          "error": undefined,
          "loading": false,
        }
      `)
    })

    it('is connected', async () => {
      const { result } = renderHook(() => useConnect())

      await actHook(async () => {
        const mockConnector = result.current[0].data.connectors[0]
        await result.current[1](mockConnector)
      })

      const { data: { connector, connectors, ...restData } = {}, ...rest } =
        result.current[0]
      expect(connectors?.length).toEqual(1)
      expect(connector).toBeDefined()
      expect({ data: restData, ...rest }).toMatchInlineSnapshot(`
        {
          "data": {
            "connected": true,
          },
          "error": undefined,
          "loading": false,
        }
      `)
    })
  })

  describe('connect', () => {
    it('succeeds', async () => {
      const { result } = renderHook(() => useConnect())

      await actHook(async () => {
        const mockConnector = result.current[0].data.connectors[0]
        const res = await result.current[1](mockConnector)

        const {
          connector,
          data: { provider, ...rest },
        } = <any>res
        expect(connector).toBeDefined()
        expect(provider).toBeDefined()
        expect(rest).toMatchInlineSnapshot(`
          {
            "account": "0x012363D61BDC53D0290A0f25e9C89F8257550FB8",
            "chainId": 1,
          }
        `)
      })
    })

    it('fails', async () => {
      const { result } = renderHook(() => useConnect(), {
        initialProps: {
          connectors: [
            new MockConnector({
              chains: defaultChains,
              options: {
                flags: {
                  failConnect: true,
                },
                privateKey: wallets.ethers1.privateKey,
                network: 1,
              },
            }),
          ],
        },
      })

      await actHook(async () => {
        const mockConnector = result.current[0].data.connectors[0]
        const res = await result.current[1](mockConnector)
        expect(res).toMatchInlineSnapshot(
          `[UserRejectedRequestError: User rejected request]`,
        )
      })
    })
  })
})
