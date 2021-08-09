from pyteal import *

"""
The character can survive three shots
"""

# linear congruential generator
def approval():
  # zxsprectrum init
  on_init = Seq([
    # initial values for pseudo random generator
    App.globalPut(Bytes("a"), Int(75)),
    App.globalPut(Bytes("c"), Int(74)),
    App.globalPut(Bytes("m"), Int(65537)), #(1<<16)+1
    App.globalPut(Bytes("x"), Int(28652)),
    #
    App.globalPut(Bytes("hit"), Int(0)),
    App.globalPut(Bytes("bullet_loc"), Int(4)),
    App.globalPut(Bytes("miss"), Int(0)),
    App.globalPut(Bytes("admin"), Txn.sender()),
    #
    Return(Int(1)),
  ])
  
  is_admin = Txn.sender() == App.globalGet(Bytes("admin"))

  # x = (a*x + c) % m
  gen_number = ((App.globalGet(Bytes("a"))*App.globalGet(Bytes("x")))+App.globalGet(Bytes("c")))%App.globalGet(Bytes("m"))


  hit = Seq([
    App.globalPut(Bytes("hit"), App.globalGet(Bytes("hit")) + Int(1)),
    Return(Int(1))
  ])

  miss = Seq([
    App.globalPut(Bytes("miss"), App.globalGet(Bytes("miss")) + Int(1)),
    Return(Int(1))
  ])

  rand = ScratchVar(TealType.uint64)
  take_shot = Seq([
    If(App.globalGet(Bytes("hit")) >= Int(10), Return(Int(0))),
    App.globalPut(Bytes("x"), gen_number), # update random value
    rand.store(App.globalGet(Bytes("x")) % Int(6)), # reduce to six shots
    If(rand.load() == App.globalGet(Bytes("bullet_loc")),
      hit,
      miss
    ),
    Return(Int(1)) 
  ])

  if_is_admin = If(is_admin, Return(Int(1)))
  loc = Btoi(Txn.application_args[1])
  reset_game = Seq([
    if_is_admin,
    App.globalPut(Bytes("hit"), Int(0)),
    App.globalPut(Bytes("bullet_loc"), loc),
    App.globalPut(Bytes("miss"), Int(0)),
    Return(Int(1)),
  ])

  return Cond(
    [Txn.application_id() == Int(0), on_init],
    [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_admin)],
    [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_admin)],
    [Txn.application_args[0] == Bytes("take_shot"), take_shot],
    [Txn.application_args[0] == Bytes("reset_game"), reset_game],
  )

def clear():
  return Seq([Return(Int(1))])

if __name__ == '__main__':
  with open('game.teal', 'w') as f:
    compiled = compileTeal(approval(), mode=Mode.Application, version=2)
    f.write(compiled)
  with open('clear.teal', 'w') as f:
    compiled = compileTeal(clear(), mode=Mode.Application, version=2)
    f.write(compiled)
