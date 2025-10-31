# evidence_registry.py
# PyTeal v8+ (Boxes). Compile with: compileTeal(approval_program(), mode=Mode.Application, version=8)
from pyteal import *

def approval_program():
    ADMIN_KEY = Bytes("admin")
    NEXT_EVIDENCE_KEY = Bytes("next_evi")

    @Subroutine(TealType.bytes)
    def box_name_for_evidence(evi_id: Expr) -> Expr:
        return Concat(Bytes("evi:"), evi_id)

    on_create = Seq(
        App.globalPut(ADMIN_KEY, Txn.sender()),
        App.globalPut(NEXT_EVIDENCE_KEY, Int(0)),
        Approve()
    )

    # submit_evidence(evidence_id, ipfs_cid, sha256_hex)
    submit_evidence = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        # Use ':=' for assignment in PyTeal
        evi_id := Txn.application_args[0],
        cid := Txn.application_args[1],
        sha := Txn.application_args[2],
        bn := box_name_for_evidence(evi_id),
        Assert(Not(BoxExists(bn))),
        ts := Itob(Global.latest_timestamp()),
        value := Concat(cid, Bytes("|"), sha, Bytes("|"), Txn.sender(), Bytes("|"), ts),
        BoxPut(bn, value),
        App.globalPut(NEXT_EVIDENCE_KEY, App.globalGet(NEXT_EVIDENCE_KEY) + Int(1)),
        Log(Concat(Bytes("EvidenceSubmitted|"), evi_id, Bytes("|"), Txn.sender(), Bytes("|"), ts)),
        Approve()
    ])

    # verify_evidence(evidence_id, sha256_hex)
    verify_evidence = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        evi_id := Txn.application_args[0],
        provided_sha := Txn.application_args[1],
        bn := box_name_for_evidence(evi_id),
        Assert(BoxExists(bn)),
        stored := BoxGet(bn),
        parts := Split(stored, Bytes("|")),
        stored_sha := parts[1],  # Direct access instead of ScratchVar
        is_ok := (stored_sha == provided_sha),
        If(is_ok)
        .Then(Log(Concat(Bytes("EvidenceVerified|"), evi_id, Bytes("|true"))))
        .Else(Log(Concat(Bytes("EvidenceVerified|"), evi_id, Bytes("|false")))),
        Return(is_ok)
    ])

    # read_evidence(evidence_id)
    read_evidence = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        evi_id := Txn.application_args[0],
        bn := box_name_for_evidence(evi_id),
        Assert(BoxExists(bn)),
        Log(Concat(Bytes("EvidenceRead|"), evi_id, Bytes("|"), BoxGet(bn))),
        Approve()
    ])

    # revoke_evidence(evidence_id) -- admin only
    revoke_evidence = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        Assert(Txn.sender() == App.globalGet(ADMIN_KEY)),
        evi_id := Txn.application_args[0],
        bn := box_name_for_evidence(evi_id),
        If(BoxExists(bn)).Then(BoxDelete(bn)),
        Log(Concat(Bytes("EvidenceRevoked|"), evi_id)),
        Approve()
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("submit_evidence"), submit_evidence],
        [Txn.application_args[0] == Bytes("verify_evidence"), verify_evidence],
        [Txn.application_args[0] == Bytes("read_evidence"), read_evidence],
        [Txn.application_args[0] == Bytes("revoke_evidence"), revoke_evidence],
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(ADMIN_KEY))],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

    return program

def clear_state_program():
    return Approve()
