# profile_manager.py
from pyteal import *

def approval_program():
    ADMIN_KEY = Bytes("admin")  # contract creator
    # Box names: "profile:" + addr or "profile:<profile_id>"

    @Subroutine(TealType.bytes)
    def box_name_for_profile(user_addr: Expr) -> Expr:
        return Concat(Bytes("profile:"), user_addr)

    on_create = Seq(
        App.globalPut(ADMIN_KEY, Txn.sender()),
        Approve()
    )

    # register_profile(profile_id, profile_blob) -> stores profile_blob (must be hashed/encrypted)
    register = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        profile_id := Txn.application_args[0],  # optional id
        profile_blob := Txn.application_args[1],
        bn := box_name_for_profile(Txn.sender()),
        # prevent duplicate profile for same wallet
        Assert(Not(BoxExists(bn))),
        ts := Itob(Global.latest_timestamp()),
        value := Concat(profile_id, Bytes("|"), profile_blob, Bytes("|"), ts),
        BoxPut(bn, value),
        Log(Concat(Bytes("ProfileRegistered|"), Txn.sender(), Bytes("|"), profile_id, Bytes("|"), ts)),
        Approve()
    )

    # update_profile(profile_blob) -> only wallet owner
    update = Seq(
        Assert(Txn.application_args.length() == Int(1)),
        new_blob := Txn.application_args[0],
        bn := box_name_for_profile(Txn.sender()),
        Assert(BoxExists(bn)),
        parts := Split(BoxGet(bn), Bytes("|")),
        profile_id := parts[0],
        ts := Itob(Global.latest_timestamp()),
        new_val := Concat(profile_id, Bytes("|"), new_blob, Bytes("|"), ts),
        BoxPut(bn, new_val),
        Log(Concat(Bytes("ProfileUpdated|"), Txn.sender(), Bytes("|"), ts)),
        Approve()
    )

    # read_profile(address) -> logs the box; anyone can read but returns via log
    read = Seq(
        Assert(Txn.application_args.length() == Int(1)),
        addr := Txn.application_args[0],
        bn := box_name_for_profile(addr),
        Assert(BoxExists(bn)),
        Log(Concat(Bytes("ProfileRead|"), addr, Bytes("|"), BoxGet(bn))),
        Approve()
    )

    # revoke_profile() -> only owner can delete their profile
    revoke = Seq(
        bn := box_name_for_profile(Txn.sender()),
        Assert(BoxExists(bn)),
        BoxDelete(bn),
        Log(Concat(Bytes("ProfileRevoked|"), Txn.sender())),
        Approve()
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.NoOp, Cond(
            [Txn.application_args[0] == Bytes("register_profile"), register],
            [Txn.application_args[0] == Bytes("update_profile"), update],
            [Txn.application_args[0] == Bytes("read_profile"), read],
            [Txn.application_args[0] == Bytes("revoke_profile"), revoke],
        )]
    )

    return program

def clear_state_program():
    return Approve()
