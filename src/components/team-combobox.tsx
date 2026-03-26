'use client'

import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ChevronsUpDownIcon } from 'lucide-react'

function isoToFlag(iso: string) {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('')
}

const TEAM_FLAGS: Record<string, string> = {
  // Hosts
  USA: isoToFlag('US'),
  Canada: isoToFlag('CA'),
  Mexico: isoToFlag('MX'),
  // CONMEBOL
  Argentina: isoToFlag('AR'),
  Brazil: isoToFlag('BR'),
  Colombia: isoToFlag('CO'),
  Uruguay: isoToFlag('UY'),
  Ecuador: isoToFlag('EC'),
  Venezuela: isoToFlag('VE'),
  Bolivia: isoToFlag('BO'),
  Chile: isoToFlag('CL'),
  Paraguay: isoToFlag('PY'),
  Peru: isoToFlag('PE'),
  // UEFA
  France: isoToFlag('FR'),
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Germany: isoToFlag('DE'),
  Spain: isoToFlag('ES'),
  Portugal: isoToFlag('PT'),
  Netherlands: isoToFlag('NL'),
  Italy: isoToFlag('IT'),
  Switzerland: isoToFlag('CH'),
  Denmark: isoToFlag('DK'),
  Austria: isoToFlag('AT'),
  Serbia: isoToFlag('RS'),
  Croatia: isoToFlag('HR'),
  Turkey: isoToFlag('TR'),
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  Slovakia: isoToFlag('SK'),
  Hungary: isoToFlag('HU'),
  Poland: isoToFlag('PL'),
  Belgium: isoToFlag('BE'),
  'Czech Republic': isoToFlag('CZ'),
  Greece: isoToFlag('GR'),
  Norway: isoToFlag('NO'),
  Sweden: isoToFlag('SE'),
  Finland: isoToFlag('FI'),
  Russia: isoToFlag('RU'),
  Ukraine: isoToFlag('UA'),
  Romania: isoToFlag('RO'),
  Bulgaria: isoToFlag('BG'),
  Slovenia: isoToFlag('SI'),
  Albania: isoToFlag('AL'),
  Iceland: isoToFlag('IS'),
  Ireland: isoToFlag('IE'),
  Bosnia: isoToFlag('BA'),
  Montenegro: isoToFlag('ME'),
  'North Macedonia': isoToFlag('MK'),
  Georgia: isoToFlag('GE'),
  // CONCACAF
  Panama: isoToFlag('PA'),
  'Costa Rica': isoToFlag('CR'),
  Honduras: isoToFlag('HN'),
  Jamaica: isoToFlag('JM'),
  'Trinidad and Tobago': isoToFlag('TT'),
  'El Salvador': isoToFlag('SV'),
  Haiti: isoToFlag('HT'),
  Cuba: isoToFlag('CU'),
  Guatemala: isoToFlag('GT'),
  // CAF
  Morocco: isoToFlag('MA'),
  Senegal: isoToFlag('SN'),
  Egypt: isoToFlag('EG'),
  Nigeria: isoToFlag('NG'),
  'Ivory Coast': isoToFlag('CI'),
  'South Africa': isoToFlag('ZA'),
  'DR Congo': isoToFlag('CD'),
  Ghana: isoToFlag('GH'),
  Cameroon: isoToFlag('CM'),
  Algeria: isoToFlag('DZ'),
  Tunisia: isoToFlag('TN'),
  Mali: isoToFlag('ML'),
  // AFC
  Japan: isoToFlag('JP'),
  'South Korea': isoToFlag('KR'),
  Australia: isoToFlag('AU'),
  'Saudi Arabia': isoToFlag('SA'),
  Iran: isoToFlag('IR'),
  Iraq: isoToFlag('IQ'),
  Jordan: isoToFlag('JO'),
  Uzbekistan: isoToFlag('UZ'),
  China: isoToFlag('CN'),
  India: isoToFlag('IN'),
  Qatar: isoToFlag('QA'),
  UAE: isoToFlag('AE'),
  // OFC
  'New Zealand': isoToFlag('NZ'),
}

export function getTeamFlag(name: string): string {
  return TEAM_FLAGS[name] ?? ''
}

interface Team {
  id: string
  name: string
}

interface TeamComboboxProps {
  name: string
  teams: Team[]
  excludeId?: string
  selectedId: string
  onSelect: (id: string) => void
  placeholder?: string
}

export function TeamCombobox({
  name,
  teams,
  excludeId,
  selectedId,
  onSelect,
  placeholder = 'Select team…',
}: TeamComboboxProps) {
  const [open, setOpen] = useState(false)

  const available = teams.filter((t) => t.id !== excludeId)
  const selected = teams.find((t) => t.id === selectedId)

  return (
    <>
      <input type="hidden" name={name} value={selectedId} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-between font-normal',
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none">{getTeamFlag(selected.name)}</span>
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search teams…" />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup>
                {available.map((team) => (
                  <CommandItem
                    key={team.id}
                    value={team.name}
                    data-checked={selectedId === team.id ? 'true' : undefined}
                    onSelect={() => {
                      onSelect(team.id)
                      setOpen(false)
                    }}
                  >
                    <span className="text-lg leading-none">{getTeamFlag(team.name)}</span>
                    {team.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
